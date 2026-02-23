import { redirect } from 'next/navigation'

export default function RecipeRedirect({ params }: { params: { id: string } }) {
  redirect(`/ai/recipe/${params.id}`)
}
