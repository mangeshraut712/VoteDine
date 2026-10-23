import { describe, expect, it } from "vitest";
import { SocialShareService } from "./social-share.js";
import { SocialPlatform } from "../types/social-share.js";
import { VoiceCommandService } from "./voice-commands.js";
import { VoiceIntent } from "../types/voice-commands.js";

describe("SocialShareService", () => {
  const service = SocialShareService.getInstance();

  it("does not put a javascript URL or a mailto header into a share link", () => {
    const validation = service.validateShareContent({
      type: "room",
      title: "Hi",
      description: "Come vote",
      roomCode: "FRIDAY01",
      url: "javascript:alert(1)",
    });
    expect(validation.isValid).toBe(false);

    const url = service.generateShareUrl({
      type: "achievement",
      title: "Hello\r\nBcc: bob@evil.example",
      description: "Dinner",
      url: "https://votedine.example/rooms/FRIDAY01",
    }, SocialPlatform.EMAIL);
    const subject = url.slice(0, url.indexOf("&body="));
    expect(subject).not.toContain("%0A");
    expect(subject).not.toContain("%0D");
    expect(subject).toContain("Hello%20Bcc");
    expect(url.startsWith("mailto:")).toBe(true);
  });

  it("does not drop the last trending item when limit is negative", async () => {
    const trending = await service.getTrendingContent(-1);
    expect(trending.length).toBe(2);
  });
});

describe("VoiceCommandService", () => {
  it("handles the end-voting intent instead of falling through", async () => {
    const service = VoiceCommandService.getInstance() as unknown as {
      executeCommand: (command: { intent: VoiceIntent; entities: [] }, roomId?: string) => Promise<{ text: string; action?: { type: string } }>;
    };
    const response = await service.executeCommand({
      intent: VoiceIntent.END_VOTING,
      entities: [],
    }, "room-1");
    expect(response.action?.type).toBe("end_voting");
    expect(response.text.toLowerCase()).toContain("ending");
  });
});
