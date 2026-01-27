FROM elasticsearch:7.17.9

WORKDIR /app

RUN elasticsearch-plugin install analysis-icu
