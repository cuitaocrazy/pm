FROM openjdk:11-jre
RUN mkdir -p /app
WORKDIR /app
COPY build/libs/*.jar /app
RUN mv *.jar oauth2-gw.jar
CMD ["java", "-jar", "oauth2-gw.jar"]
EXPOSE 8090