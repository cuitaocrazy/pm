package com.yada.gw

import org.springframework.beans.factory.ObjectProvider
import org.springframework.cloud.gateway.filter.GatewayFilter
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.switchIfEmpty

@Component
class OAuthApiGatewayFilterFactory(private val clientManagerProvider: ObjectProvider<ReactiveOAuth2AuthorizedClientManager>) :
    AbstractGatewayFilterFactory<OAuthApiGatewayFilterFactory.Config>(Config::class.java) {
    class Config

    override fun apply(config: Config?) = GatewayFilter { exchange, chain ->
        exchange.getPrincipal<OAuth2AuthenticationToken>()
            .flatMap { authentication -> authorizedClient(exchange, authentication) }
            .map(OAuth2AuthorizedClient::getAccessToken)
            .map {
                withBearerAuth(exchange, it)
            }.switchIfEmpty {
                exchange.response.statusCode = HttpStatus.UNAUTHORIZED
                exchange.response.setComplete().then(Mono.empty())
            }.flatMap(chain::filter)
    }

    private fun authorizedClient(
        exchange: ServerWebExchange,
        oauth2Authentication: OAuth2AuthenticationToken
    ): Mono<OAuth2AuthorizedClient> {
        val clientRegistrationId = oauth2Authentication.authorizedClientRegistrationId
        val request = OAuth2AuthorizeRequest.withClientRegistrationId(clientRegistrationId)
            .principal(oauth2Authentication).build()
        val clientManager = clientManagerProvider.ifAvailable
            ?: return Mono.error(
                IllegalStateException(
                    "No ReactiveOAuth2AuthorizedClientManager bean was found. Did you include the "
                            + "org.springframework.boot:spring-boot-starter-oauth2-client dependency?"
                )
            )
        return clientManager.authorize(request)
    }

    private fun withBearerAuth(exchange: ServerWebExchange, accessToken: OAuth2AccessToken): ServerWebExchange {
        return exchange.mutate().request { r: ServerHttpRequest.Builder ->
            r.headers { headers: HttpHeaders ->
                headers.setBearerAuth(
                    accessToken.tokenValue
                )
                headers.set("COOKIE", "")
            }
        }.build()
    }
}