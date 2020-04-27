FROM node as build
ADD ./ /workspace
WORKDIR /workspace

RUN npm install && npm run build

FROM node:slim

COPY --from=build /workspace/dist /usr/lib/webmon-web/
EXPOSE 8080
CMD node /usr/lib/webmon-web/index.js