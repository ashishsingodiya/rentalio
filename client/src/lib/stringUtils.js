export const capitalizeWords = (str) => {
  if(str === "pg") return "PG"
  return str
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-"),
    )
    .join(" ");
};