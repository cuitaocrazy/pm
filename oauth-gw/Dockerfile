FROM openjdk:11-jre
RUN mkdir -p /app
WORKDIR /app
COPY build/libs/*.jar /app
CMD ["java", "-jar", "*.jar"]
EXPOSE 8090