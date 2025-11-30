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

# Timezones
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata

COPY --from=backend-build /app/out .
COPY --from=frontend-build /app/dist wwwroot
ENTRYPOINT ["dotnet", "Api.dll"]
