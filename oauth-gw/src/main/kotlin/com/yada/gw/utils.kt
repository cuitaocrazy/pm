package com.yada.gw

import org.springframework.beans.factory.ObjectProvider
import org.springframework.http.HttpHeaders
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

private fun authorizedClient(
    oauth2Authentication: OAuth2AuthenticationToken,
    clientManagerProvider: ObjectProvider<ReactiveOAuth2AuthorizedClientManager>
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

private fun withBearerAuth(exchange: ServerWebExchange, accessToken: String): ServerWebExchange {
    return exchange.mutate().request { r: ServerHttpRequest.Builder ->
        r.headers { headers: HttpHeaders ->
            headers.setBearerAuth(
                accessToken
            )
            headers.set("COOKIE", "")
        }
    }.build()
}

fun exchangeWithBearer(
    exchange: ServerWebExchange,
    clientManagerProvider: ObjectProvider<ReactiveOAuth2AuthorizedClientManager>
): Mono<ServerWebExchange> {
    return exchange.getPrincipal<OAuth2AuthenticationToken>()
        .flatMap { authorizedClient(it, clientManagerProvider) }
        .map {
            it.accessToken.tokenValue
        }.map {
            withBearerAuth(exchange, it)
        }
}

