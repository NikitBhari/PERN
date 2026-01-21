backend:
    build: ./01_nodejs
    container_name: pern_backend
    ports:
      - "8081:8081"
    environment:
      PORT: 8081
      DB_USER: postgres
      DB_PASSWORD: 123456
      DATABASE: authdb
      DBPORT: 5432
      DB_HOST: host.docker.internal   # 🔥 connect to existing Postgres
      JWT_SECRET: mysecretkey123
      PIXABAY_KEY: 54250962-9626b86513571f35867cccb07
      PEXELS_KEY: 6NWagCPzMtwN1el0JCW8SpptVp6NIWejizDUjgGKahbasoEH3B0o5RNq