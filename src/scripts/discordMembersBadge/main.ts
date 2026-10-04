const DiscordMembersBadgeError = (message?: string) =>
  Error(`Discord Members Badge Error${message ? `: ${message}` : ""}`);

export async function getDiscordMembers(invite: string): Promise<{
  all: number;
  online: number;
}> {
  const response = await fetch(
    `https://discord.com/api/v9/invites/${invite}?with_counts=true`,
  );
  const json = await response.json();

  return {
    all: json["approximate_member_count"],
    online: json["approximate_presence_count"],
  };
}

export async function makeDiscordMembersBadge(badgeContainer: HTMLDivElement) {
  const allMembersBadge = badgeContainer.querySelector(".all-members");
  if (!(allMembersBadge instanceof HTMLSpanElement))
    throw DiscordMembersBadgeError();
  const onlineMembersBadge = badgeContainer.querySelector(".online-members");
  if (!(onlineMembersBadge instanceof HTMLSpanElement))
    throw DiscordMembersBadgeError();

  allMembersBadge.innerText = `Loading`;
  onlineMembersBadge.innerText = `members...`;

  const members = await getDiscordMembers("Zf6bnhzRXH");

  allMembersBadge.innerText = `${members.all} members`;
  onlineMembersBadge.innerText = `${members.online} online`;
}
