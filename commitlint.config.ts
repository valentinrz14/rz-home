import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // nueva funcionalidad
        "fix",      // corrección de bug
        "docs",     // solo documentación
        "style",    // formato, sin cambio de lógica
        "refactor", // refactor sin feat ni fix
        "test",     // agregar o corregir tests
        "chore",    // mantenimiento (build, deps)
        "perf",     // mejora de rendimiento
        "ci",       // cambios en CI
        "build",    // sistema de build
        "revert",   // revert de un commit anterior
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 100],
    "subject-min-length": [2, "always", 10],
    "body-max-line-length": [2, "always", 200],
    "header-max-length": [2, "always", 120],
  },
};

export default config;
