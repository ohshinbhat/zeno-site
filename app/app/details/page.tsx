import { redirect } from "next/navigation";

export default function DetailsRedirect(): never {
  redirect("/app");
}
