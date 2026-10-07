const DiscordMembersBadgeError = (message?: string) =>
  Error(`Discord Members Badge Error${message ? `: ${message}` : ""}`);

type MemberCount = {
  all: number;
  online: number;
};

async function getMemberCount(invite: string): Promise<MemberCount> {
  const response = await fetch(
    `https://discord.com/api/v9/invites/${invite}?with_counts=true`,
  );
  const json = await response.json();

  return {
    all: json["approximate_member_count"],
    online: json["approximate_presence_count"],
  };
}

function generateBadge(text: string): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.classList.add("badge");
  badge.innerText = text;
  return badge;
}

export async function makeDiscordMembersBadge(badgeContainer: HTMLDivElement) {
  const infoBadge = badgeContainer.querySelector(".info");
  if (!(infoBadge instanceof HTMLSpanElement)) throw DiscordMembersBadgeError();

  const memberCount = await getMemberCount("Zf6bnhzRXH");

  infoBadge.remove();
  badgeContainer.appendChild(generateBadge(`${memberCount.all} members`));
  badgeContainer.appendChild(generateBadge(`${memberCount.online} online`));
}
