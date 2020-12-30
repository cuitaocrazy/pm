package com.yada.gw

import org.springframework.beans.factory.ObjectProvider
import org.springframework.cloud.gateway.filter.GatewayFilter
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory
import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.switchIfEmpty

@Component
class OAuthApiGatewayFilterFactory(private val clientManagerProvider: ObjectProvider<ReactiveOAuth2AuthorizedClientManager>) :
    AbstractGatewayFilterFactory<OAuthApiGatewayFilterFactory.Config>(Config::class.java) {
    class Config

    override fun apply(config: Config?) = GatewayFilter { exchange, chain ->
        exchangeWithBearer(exchange, clientManagerProvider)
            .switchIfEmpty {
                exchange.response.statusCode = HttpStatus.UNAUTHORIZED
                exchange.response.setComplete().then(Mono.empty())
            }.flatMap(chain::filter)
    }
}