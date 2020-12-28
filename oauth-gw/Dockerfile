FROM openjdk:11-slim
RUN mkdir -p /app
WORKDIR /app
COPY build/libs/oauth2-gw-0.0.1-SNAPSHOT.jar /app
CMD ["java", "-jar", "oauth2-gw-0.0.1-SNAPSHOT.jar"]
EXPOSE 8090