FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
ARG BUILD_CONFIGURATION=Release
WORKDIR /app
COPY api .
RUN dotnet restore && dotnet publish -o out

FROM node:lts AS frontend-build
WORKDIR /app
COPY ui .
RUN npm install && npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install --no-install-recommends tzdata curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/out .
COPY --from=frontend-build /app/dist wwwroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent --show-error --max-time 4 "http://127.0.0.1:${PORT:-5000}/" || exit 1
ENTRYPOINT ["dotnet", "Api.dll"]
