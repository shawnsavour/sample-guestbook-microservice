FROM node:20 AS build-env

ADD package.json /app/
ADD package-lock.json /app/
ADD server.js /app/

# ADD key.json /app/

RUN cd /app; npm ci --only=production

FROM gcr.io/distroless/nodejs20-debian12
COPY --from=build-env /app /app
WORKDIR /app
ENV PORT 8080
# ENV GCP_PROJECT_ID bitkub-moonshot-test
# ENV GCP_KEYFILE_PATH /app/key.json
EXPOSE 8080
CMD [ "server.js" ]