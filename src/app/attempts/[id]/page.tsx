import { AttemptView } from "@/components/AttemptView";

export default function AttemptPage({ params }: { params: { id: string } }) {
  return <AttemptView attemptId={params.id} />;
}
