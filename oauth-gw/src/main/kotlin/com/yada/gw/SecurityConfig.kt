package com.yada.gw

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers

@Configuration
class SecurityConfig {
    @Bean
    fun springSecurityFilterChain(
        http: ServerHttpSecurity,
        handler: OAuthLogoutSuccessHandler
    ): SecurityWebFilterChain {
        // 当api有post请求时，无法项form页面一样先有页面（页面带csrf token）在去做post，因此CSRF的WebFilter就认为api的post无效
        // 因此禁用csrf
        http.csrf().disable()
        http.authorizeExchange().pathMatchers(HttpMethod.GET, "/logout-oidc").authenticated()
        // 认证和授权不由这里发起，将交给下游gateway的filter
        http.authorizeExchange().anyExchange().permitAll()
        http.logout().requiresLogout(ServerWebExchangeMatchers.pathMatchers(HttpMethod.GET, "/logout-oidc"))
            .logoutSuccessHandler(handler)
        http.oauth2Login()
        http.oauth2Client()
        return http.build()
    }
}