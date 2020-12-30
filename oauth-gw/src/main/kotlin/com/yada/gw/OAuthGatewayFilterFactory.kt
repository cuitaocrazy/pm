package com.yada.gw

import org.springframework.beans.factory.ObjectProvider
import org.springframework.cloud.gateway.filter.GatewayFilter
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.switchIfEmpty

@Component
class OAuthGatewayFilterFactory(
    private val clientManagerProvider: ObjectProvider<ReactiveOAuth2AuthorizedClientManager>
) : AbstractGatewayFilterFactory<OAuthGatewayFilterFactory.Config>(Config::class.java) {

    class Config {
        var staticPaths: Array<String> = arrayOf()
    }

    override fun shortcutFieldOrder(): MutableList<String> = mutableListOf("staticPaths")

    override fun apply(config: Config) = GatewayFilter { exchange, chain ->
        Mono.just(config.staticPaths)
            .filter { it.isNotEmpty() }
            .flatMap { ServerWebExchangeMatchers.pathMatchers(*it).matches(exchange) }
            .filter { it.isMatch }
            .map { exchange }
            .switchIfEmpty {
                exchangeWithBearer(exchange, clientManagerProvider)
                    .switchIfEmpty {
                        Mono.error(org.springframework.security.access.AccessDeniedException("Access Denied!"))
                    }
            }.flatMap(chain::filter)
    }
}