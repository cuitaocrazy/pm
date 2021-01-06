package com.yada.gw

import org.springframework.cloud.gateway.filter.GatewayFilter
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class RedirectWithAnchorGatewayFilterFactory :
    AbstractGatewayFilterFactory<RedirectWithAnchorGatewayFilterFactory.Config>(Config::class.java) {
    class Config {
        var path = ""
    }

    override fun shortcutFieldOrder(): MutableList<String> = mutableListOf("path")

    override fun apply(config: Config) = GatewayFilter { exchange, chain ->
        val path = ServerWebExchangeUtils.expand(exchange, config.path);
        if (!exchange.response.isCommitted) {
            ServerWebExchangeUtils.setResponseStatus(exchange, HttpStatus.FOUND)
            val response = exchange.response
            response.headers[HttpHeaders.LOCATION] = exchange.request.uri.let { it.scheme + "://" + it.authority } + path
            response.setComplete()
        } else {
            Mono.empty<Void>()
        }
    }
}