package com.yada.gw

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class OAuthGwApplication

fun main(args: Array<String>) {
    runApplication<OAuthGwApplication>(*args)
}
