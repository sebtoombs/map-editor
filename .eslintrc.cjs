module.exports = {
  extends: ["airbnb", "airbnb/hooks", "airbnb-typescript", "prettier"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/react-in-jsx-scope": "off",
    "no-param-reassign": [
      1,
      {
        props: true,
        ignorePropertyModificationsFor: ["state", "draft"],
      },
    ],
  },
};
