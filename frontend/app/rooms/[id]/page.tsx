import { DEMO_ROOM_ID } from "@/lib/demo";
import RoomClient from "./room-client";

export function generateStaticParams() {
  return [{ id: DEMO_ROOM_ID }];
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomClient id={id} />;
}
