---
title: "IPv6 at Home in 2026: Still Unnecessarily Hard"
author: Christian Elsen
excerpt: A look at why using IPv6 on a home network in 2026 is still unnecessarily difficult, from ISPs breaking it to network gear ignoring it, and how I worked around broken IPv6 failover on the UniFi 5G Backup.
layout: single
image: /content/uploads/2026/06/title-ipv6-at-home.png
header:
  og_image: /content/uploads/2026/06/title-ipv6-at-home.png
permalink: /2026/06/17/ipv6-at-home-still-unnecessarily-hard/
categories:
  - EdgeCloud
tags:
  - IPv6
  - Network
  - Unifi
toc: true
toc_sticky: true
---

It's 2026. IPv6 has been standardized for nearly three decades. Mobile carriers run it as their primary protocol. Content delivery networks serve the majority of their traffic over it. And yet, running IPv6 reliably on a home network remains unnecessarily hard — not because of any fundamental technical barrier, but because ISPs and equipment vendors keep breaking it, ignoring it, or both.

This post documents my multi-year journey through the wreckage: AT&T taking years to get IPv6 right, Google Fiber deliberately blocking it over MoCA, T-Mobile Home Internet shipping without DHCPv6-PD, and Ubiquiti's UniFi 5G Backup completely forgetting about IPv6 failover. Then I'll show how I worked around the last problem, because waiting for vendors to fix things is not a strategy.

<!-- IMAGE: Title/hero image - A network diagram showing a home setup with multiple WAN connections (fiber, MoCA, cellular) with IPv6 traffic paths, some marked with red X to indicate broken paths. Clean, minimal style consistent with existing blog graphics. Save as /content/uploads/2026/06/title-ipv6-at-home.png -->
{% include figure image_path="/content/uploads/2026/06/title-ipv6-at-home.png" caption="Figure 1: The state of IPv6 on a multi-WAN home network in 2026 — more broken paths than working ones" %}

# The ISP Landscape: A Trail of Broken Promises

## AT&T: Eventually Reliable, But It Took Years

My relationship with AT&T and IPv6 goes back years. In 2019, I documented in detail [how AT&T broke my IPv6 Internet connection](/2019/02/13/how-att-broke-my-ipv6/) — a multi-day outage deep inside their network that they had no ability or interest in diagnosing, let alone fixing. Using RIPE Atlas I was able to pinpoint exactly when and where the failure occurred, but finding anyone at AT&T with knowledge of IPv6 who could actually fix it proved impossible.

That 2019 incident wasn't an isolated event. At the time, looking at the RIPE Atlas data for my AT&T connection showed frequent IPv6 packet loss and full outages lasting multiple days (See Figure 2).

<!-- IMAGE: Screenshot of RIPE Atlas historical graph showing IPv6 RTT/availability to a root DNS server over the AT&T connection, showing the troubled early years (2017-2020) with visible outages, then stable reliability from ~2021 onward. Save as /content/uploads/2026/06/ipv6-att-ripe-atlas-history.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-att-ripe-atlas-history.png" caption="Figure 2: RIPE Atlas IPv6 availability over AT&T residential fiber — rocky early years, but solid reliability since ~2021" %}

To AT&T's credit, things have improved substantially. Over the last five years, IPv6 on their residential fiber product has been very reliable. But that history matters — it took AT&T years to get IPv6 right, and the experience of dealing with their support during those outages was a reminder that ISPs treat IPv6 as an afterthought. The one thing AT&T consistently excels at is overcharging their customers. Getting IPv6 to work reliably took considerably more effort on their part.

## Google Fiber (Webpass MoCA): IPv6 Apparently Too Hard

[Webpass](https://webpass.net/) was an ISP that focused exclusively on multi-family condos and apartment buildings in large cities, delivering gigabit Internet over standard Cat5 cabling with switched ports directly to each unit. The original Webpass offering was great — fast, affordable, no contracts, no equipment rental fees. Exactly what every city dweller dreams of when they're stuck choosing between overpriced cable monopolies. Buildings that only had coaxial cabling — typically locked into getting ripped off by cable providers like the horrible Xfinity — were out of luck.

In 2016, [Google Fiber acquired Webpass](https://fiber.google.com/blog/2016/10/welcome-webpass-to-google-fiber-family.html). After the acquisition, Google added MoCA (Multimedia over Coax Alliance) support to extend the Webpass service to buildings that only had coax infrastructure. The idea was sound: bring competitive gigabit service to buildings previously stuck with cable monopolies, without requiring new cabling.

The implementation, however, left IPv6 behind. When I tried the Webpass MoCA offering in 2022, I discovered that Google hadn't simply forgotten to implement IPv6 over the MoCA delivery path — they actively blocked it via firewall rules. And when asked about it, they clearly communicated that they had no plans to ever add IPv6 support over MoCA.

This is Google — a company that runs one of the largest IPv6 deployments on the planet, that serves the majority of its traffic over IPv6, that has been a vocal advocate for IPv6 adoption for over a decade. And yet their own ISP product deliberately firewalls off IPv6 for an entire class of customers, with no intention of fixing it.

As of 2026, this problem still exists. While the Cat5 Webpass service supports IPv6 just fine, the MoCA variant remains deliberately blocked. If your ISP cannot deliver both protocol stacks reliably, they are not a serious ISP.

<!-- IMAGE: Screenshot of test-ipv6.com results showing IPv6 failure/unsupported on a Google Fiber Webpass MoCA connection, or a screenshot of the Google Fiber support page acknowledging the IPv6 MoCA limitation. Save as /content/uploads/2026/06/ipv6-google-fiber-moca-broken.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-google-fiber-moca-broken.png" caption="Figure 3: IPv6 test results on Google Fiber Webpass over MoCA — not supported" %}

## T-Mobile Home Internet: No DHCPv6-PD, No Prefix Delegation

In 2024, I evaluated T-Mobile Home Internet (TMHI) as a potential primary or backup connection. T-Mobile's mobile network runs IPv6 natively — it's their primary protocol, with IPv4 provided via CGNAT and 464XLAT as a compatibility layer. So you'd expect their home internet product to offer full IPv6 support, including prefix delegation for internal subnets.

You'd be wrong.

T-Mobile Home Internet provides a single /64 prefix via SLAAC to the connected device. There is no DHCPv6-PD support — you cannot request a /56 or even a /48 to subnet across your internal network. A single /64 means:

- You cannot assign separate prefixes to separate VLANs
- You cannot maintain firewall isolation between network segments using distinct subnets
- You are limited to a flat network topology for IPv6

To make matters worse, if you want to use IPv6 at all, you're forced to use T-Mobile's lousy gateway device as your router. If you want to use your own router behind the T-Mobile gateway — as anyone with a serious home network setup will — you're stuck with double NAT on IPv4 and completely out of luck on IPv6. Without DHCPv6-PD, the T-Mobile gateway has no mechanism to delegate a prefix to your downstream router. Your only option at that point is NAT66, which defeats the entire purpose of IPv6's end-to-end connectivity model.

<!-- IMAGE: Diagram comparing a proper DHCPv6-PD setup (ISP delegates /56, gateway assigns /64 per VLAN to IoT, Guest, LAN segments) versus T-Mobile's single /64 (flat topology, no segmentation possible). Side-by-side comparison. Save as /content/uploads/2026/06/ipv6-tmhi-no-pd.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-tmhi-no-pd.png" caption="Figure 4: DHCPv6-PD enables proper network segmentation (left) — T-Mobile Home Internet's single /64 forces a flat topology (right)" %}

For a household running a single subnet with no segmentation, this might be acceptable. For anyone running VLANs, IoT isolation, guest networks, or any form of network segmentation — which is to say, anyone who takes network security seriously — T-Mobile Home Internet is not a viable option as an IPv6-capable ISP.

As of 2026, this limitation still exists.

# The Hardware Problem: UniFi 5G Backup and IPv6 Failover

## Ubiquiti Forgot About IPv6

With unreliable ISPs as the norm, multi-WAN failover becomes essential. Ubiquiti's [UniFi 5G Backup](https://store.ui.com/us/en/category/all-unifi-cloud-gateways/products/u5g-us) is designed exactly for this use case: a cellular backup that activates when your primary WAN goes down. It pairs with the UniFi Cloud Gateway Ultra (UCG) and uses a GRE tunnel to provide seamless failover.

For IPv4, it works as advertised. For IPv6, it's completely broken.

<!-- IMAGE: Screenshot of the UniFi Network UI showing the U5G Backup in failover mode — the WAN failover status page showing IPv4 working (green) but no IPv6 information displayed at all, or the device topology view showing UCG + U5G Backup. Save as /content/uploads/2026/06/ipv6-unifi-u5g-failover-ui.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-unifi-u5g-failover-ui.png" caption="Figure 5: UniFi Network UI showing the U5G Backup in failover mode — IPv4 works, IPv6 is nowhere to be found" %}

This is particularly puzzling when you consider the product's intended use case. The failover provider for the U5G Backup will almost always be a mobile carrier. Mobile carriers run IPv6 as their primary protocol — IPv4 on cellular is provided via 464XLAT translation. A product designed to fail over to cellular, that completely ignores IPv6, is shipping a product that's broken for its primary use case.

## Three Firmware Bugs

Digging into the U5G Backup firmware revealed three distinct bugs that prevent IPv6 from working in failover mode:

1. **Wrong prefix length:** The `activate_ipv6()` function assigns a `/128` host address to the GRE tunnel interface instead of a `/64` prefix. On a point-to-point interface this creates only a host route — `odhcpd` finds no subnet to advertise and sends Router Advertisements without a Prefix Information Option, making SLAAC impossible for the parent gateway.

2. **Missing multicast flag:** GRE tunnel interfaces lack `IFF_MULTICAST` by default. `odhcpd` requires multicast capability before it will advertise on an interface. Without it, even if the prefix were correct, no RAs would be sent.

3. **Blackhole route:** A blackhole route in the routing table silently drops all IPv6 traffic forwarded via the GRE tunnel from the parent gateway. Even if bugs 1 and 2 were fixed, all forwarded IPv6 traffic would be discarded.

Three bugs, all in the same code path, all preventing the same feature from working. This isn't a subtle edge case — it's a feature that was never tested.

<!-- IMAGE: Diagram showing the U5G Backup's internal data path for IPv6 in failover mode, with the three bugs annotated: (1) /128 instead of /64 on gre1, (2) missing IFF_MULTICAST flag on gre1, (3) blackhole route in table 3 dropping forwarded traffic. Use red X marks or strikethrough to indicate where each bug blocks the flow. Save as /content/uploads/2026/06/ipv6-u5g-three-bugs.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-u5g-three-bugs.png" caption="Figure 6: Three firmware bugs in the U5G Backup's IPv6 failover path — any one of them is enough to break IPv6 entirely" %}

## The UCG Side: IPv4-Only Policy Routing

Even after fixing the U5G Backup firmware, the parent gateway (UCG) has its own gap: the Traffic Routes system that handles WAN selection for client traffic generates `iptables` rules for IPv4 but does not generate the corresponding `ip6tables` rules for IPv6. IPv6 policy routing simply does not exist in the UCG's failover logic.

This means that when IPv4 traffic is correctly routing through the cellular backup, IPv6 traffic from the same clients is either dropping into a black hole or routing via a dead primary WAN interface.

<!-- IMAGE: Side-by-side comparison of the UCG's iptables (IPv4) and ip6tables (IPv6) UBIOS_PREROUTING_PBR chains. The IPv4 side shows populated rules with fwmark assignments for traffic routes; the IPv6 side is empty — no rules generated. Terminal output or a clean formatted table. Save as /content/uploads/2026/06/ipv6-ucg-missing-ip6tables.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-ucg-missing-ip6tables.png" caption="Figure 7: UCG policy routing chains — IPv4 (left) has traffic route rules, IPv6 (right) is completely empty" %}

# Why IPv6 Failover Without BGP is Genuinely Hard

Before describing the workaround, it's worth acknowledging why this problem is genuinely difficult — not as an excuse for the vendors above, but as context for why the solution requires real engineering.

The correct enterprise solution to multi-homing and failover is BGP: announce your own Provider Independent (PI) prefix via multiple upstream providers, and let BGP routing converge when one path fails. This is completely transparent to clients.

BGP is not realistic for residential setups:

- Requires a PI address block from a Regional Internet Registry (ARIN, RIPE, etc.)
- Requires BGP sessions with your ISPs — not offered on residential connections
- Requires routing hardware and operational expertise beyond typical home networks

Without BGP, every approach to IPv6 multi-homing involves a tradeoff. The fundamental problem: when your primary ISP goes down, your clients have IPv6 addresses from that ISP's prefix. Those addresses are meaningless on the backup WAN. You either need to:

1. Give clients new addresses from the backup provider (disruptive, slow, unreliable across devices)
2. Translate the dead prefix to the backup provider's prefix at the border (NAT66/NPTv6 — breaks end-to-end transparency)
3. Use Provider Independent address space that works across both WANs (requires RIR registration)

There is no clean solution at the residential level — only less-bad ones.

<!-- IMAGE: Diagram showing the three IPv6 failover approaches without BGP: (1) re-address clients with new prefix from backup provider (arrows showing disruptive address change), (2) NAT66/NPTv6 translation at border (showing address rewrite), (3) Provider Independent space routed across both WANs (showing stable prefix with dual paths). Highlight tradeoffs of each. Save as /content/uploads/2026/06/ipv6-failover-approaches.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-failover-approaches.png" caption="Figure 8: Three approaches to IPv6 failover without BGP — each with significant tradeoffs" %}

# The Workaround: Making IPv6 Failover Work

I've published the complete solution as an open-source project: [unifi-hacks on GitHub](https://github.com/chriselsen/unifi-hacks). It covers both the U5G Backup firmware fixes and the UCG-side IPv6 failover implementation. Here's the high-level architecture.

<!-- IMAGE: Architecture diagram showing the complete IPv6 failover setup: UCG with primary WAN (fiber/AT&T via eth4) and secondary WAN (cellular via GRE tunnel to U5G Backup). Show the traffic flow for normal operation (client → UCG → AT&T) and failover (client → UCG → GRE → U5G Backup → cellular). Include the PI prefix advertisement from radvd, NAT66 SNAT on gre1, and the policy routing tables (201.eth4.0 and 178.gre1). Save as /content/uploads/2026/06/ipv6-failover-architecture.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-failover-architecture.png" caption="Figure 9: IPv6 failover architecture — normal operation via AT&T (solid lines) and failover via cellular backup (dashed lines)" %}

## Fixing the U5G Backup

The [`u5g-backup-fix`](https://github.com/chriselsen/unifi-hacks/tree/main/u5g-backup-fix) component is a small idempotent script stored in the U5G Backup's persistent storage. It corrects all three firmware bugs on every run:

- Enables multicast on the GRE tunnel interface
- Assigns the correct `/64` prefix (instead of `/128`) to the tunnel
- Removes the blackhole route that drops forwarded IPv6 traffic

Since the U5G Backup's writable filesystem is a tmpfs overlay that resets on reboot, and the activation scripts re-break things on every cellular reconnect, the fix must be applied continuously. A cron job on the UCG triggers the script via SSH every minute.

## IPv6 Policy Routing on the UCG

The [`ucg-ipv6-failover`](https://github.com/chriselsen/unifi-hacks/tree/main/ucg-ipv6-failover) component adds the IPv6 policy routing rules that the UCG's firmware should be generating natively:

- **`ip6tables` fwmark rules** in `UBIOS_PREROUTING_PBR` matching source IPv6 addresses and directing traffic to the correct routing table
- **NAT66 SNAT** on the GRE tunnel interface translating client source addresses to the cellular provider's prefix
- **MSS clamping** to prevent PMTUD black holes through the GRE tunnel (MTU 1476)
- **Fallback route** in the primary WAN routing table at a high metric, pointing to the GRE tunnel — activates automatically when the primary ISP's default route disappears

## Provider Independent Address Space

The solution uses a /64 from a PI (Provider Independent) IPv6 block obtained from ARIN. This is a workaround for yet another Ubiquiti limitation: when the primary WAN goes down, the UCG's `odhcpd` immediately withdraws the primary ISP's DHCPv6-PD prefix from Router Advertisements. Clients lose their ISP GUA before the UCG has a chance to reroute traffic via the backup WAN. There is no way to prevent this from userspace.

For a pure failover scenario, the better behavior would be for the UCG to simply keep advertising the primary ISP's prefix during the outage. If Ubiquiti implemented this, the PI prefix workaround would be unnecessary entirely. Traffic would seamlessly reroute via the cellular backup using NAT66, and clients would never notice.

But since Ubiquiti doesn't do this, PI space fills the gap. When the primary WAN fails:

1. The primary ISP's prefix gets withdrawn by `odhcpd` (unavoidable firmware behavior)
2. `radvd` advertises the PI /64 on the LAN with short lifetimes (300s)
3. Clients acquire the PI GUA and use it for new connections
4. All traffic — both from stale ISP GUAs and new PI GUAs — routes via the cellular backup through NAT66
5. On recovery, the PI prefix is removed from `radvd` and expires naturally within 5 minutes

This gives clients continuous IPv6 connectivity throughout the entire outage, including beyond the ~1 hour window where the primary ISP's DHCPv6-PD lease would normally expire. Windows, Linux, and macOS all handle this prefix transition gracefully.

Android, however, is another train wreck when it comes to IPv6 support. During failover, Android loses its IPv6 default gateway and does not recover without a WiFi toggle. It doesn't send Router Solicitations when it detects router loss, and it ignores unsolicited Router Advertisements. Every workaround I've tried — virtual router identities, radvd restarts, multiple RS bursts — has failed. A WiFi toggle is the only reliable fix. This is a known Android OS limitation with no network-side workaround — at least not with Approach 1.

<!-- IMAGE: Sequence diagram or timeline showing the failover event: (1) AT&T WAN goes down, (2) odhcpd withdraws ISP prefix, (3) radvd advertises PI /64 with 300s lifetime, (4) clients acquire PI GUA, (5) all traffic routes via gre1 with NAT66 SNAT, (6) AT&T recovers, (7) PI prefix removed, expires in ~5 minutes. Show this as a timeline with annotations. Save as /content/uploads/2026/06/ipv6-failover-sequence.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-failover-sequence.png" caption="Figure 10: IPv6 failover sequence — from primary WAN failure through cellular backup activation to recovery" %}

## A Better Path: PI-as-Primary

Looking further ahead, PI space also enables a more powerful architecture: if you always use your own PI prefix on the internal side, you can map it via NPTv6 or NAT66 to one or more ISPs in any order you choose. This opens the door to true IPv6 load balancing across multiple WANs — not just failover. Clients always see the same stable PI addresses regardless of which upstream path their traffic takes. This is functionally the IPv6 equivalent of how IPv4 multi-WAN with NAT works today, and it's the direction I'm heading with [Approach 2 (PI-as-primary)](https://github.com/chriselsen/unifi-hacks/tree/main/ucg-ipv6-failover/approach-2-pi-primary) in the repo.

Approach 2 also solves the Android problem entirely: since the PI prefix is always present and never changes during failover, clients — including Android — never experience a prefix transition at all. The failover is fully transparent.

The natural question is: why not use ULA (`fc00::/7`) for this purpose instead of PI space? After all, ULA is designed to be stable, site-local addressing independent of any ISP — exactly what this use case needs. The problem is RFC 6724: the default address selection policy on every major OS ranks ULA (precedence 3) below IPv4-mapped addresses (precedence 10). This means clients with both a ULA address and an IPv4 address will prefer IPv4 for external destinations, silently bypassing IPv6 entirely. This cannot be overridden via Router Advertisements and cannot be fixed on Android, iOS, or most IoT devices. ULA is a dead end for this use case.

PI space with GUA precedence (40 in RFC 6724) does not have this problem — every OS already prefers it over IPv4, no client-side configuration needed.

Here's the interesting part: since PI space in this architecture is only ever used within the private network — never announced to the global routing table — multiple customers could use the same PI block without interfering with each other. It's functionally equivalent to how RFC 1918 space works in IPv4: everyone uses `192.168.0.0/16` internally and NAT handles the rest. Ubiquiti could request a single PI prefix from ARIN for exactly this use case, assign /64s from it to every UniFi gateway doing multi-WAN IPv6, filter it at all WAN interfaces, and instantly give their entire customer base seamless IPv6 multi-homing without requiring each individual user to obtain their own RIR allocation. No IETF process needed. No client changes needed. It would make UniFi the first prosumer networking platform to offer transparent IPv6 multi-WAN — something that currently requires running BGP.

## Persistence Across Reboots and Firmware Upgrades

Everything is deployed via systemd services and files in `/etc/` on the UCG, which survive firmware upgrades on the Debian-based UniFi OS. A watchdog runs every minute to detect and re-apply any rules that get wiped by the UCG's internal configuration daemon (`udapi`). Cached packages ensure dependencies (like `radvd`) can be reinstalled offline after a firmware upgrade wipes apt-installed software.

<!-- IMAGE: Diagram showing the persistence architecture on the UCG: systemd services (ipv6-policy-routes.service, gre1-prefix-monitor.service, reinstall-radvd.service, restore-crontab.service) and the file layout in /etc/ipv6-policy-routes/ and /etc/systemd/system/. Show how they survive firmware upgrades (files in /etc/ persist) and how the watchdog re-applies rules wiped by udapi. Save as /content/uploads/2026/06/ipv6-failover-persistence.png -->
{% include figure image_path="/content/uploads/2026/06/ipv6-failover-persistence.png" caption="Figure 11: Persistence architecture — systemd services and watchdog ensure IPv6 failover survives reboots and firmware upgrades" %}

# What Ubiquiti Should Fix

The [unifi-hacks](https://github.com/chriselsen/unifi-hacks) repository includes detailed feature requests that describe what Ubiquiti needs to implement to make all of these scripts unnecessary:

1. **Fix the U5G Backup firmware** — three lines of code fix three bugs that prevent IPv6 from working in failover mode entirely.
2. **Keep the DHCPv6-PD prefix alive during WAN outage** — when the primary WAN goes down, the UCG immediately withdraws the ISP prefix from Router Advertisements. Retaining it for the duration of the outage would make failover transparent to all clients without requiring PI space.
3. **Generate IPv6 rules in Traffic Routes** — the UI creates IPv4 policy routing rules but silently ignores IPv6. Adding `ip6tables` equivalents is straightforward.
4. **Expose NAT66/NPTv6 in the UI** — the kernel supports it. Multi-WAN IPv6 requires it. Surface it.

These are not exotic feature requests. They represent the minimum viable functionality for a product that advertises cellular failover as a feature.

# Summary

In 2026, using IPv6 on a home network with any form of redundancy or failover remains unnecessarily hard:

- **AT&T** took years to get IPv6 reliable on residential fiber — it works now, but the history of multi-day outages and useless support shows how low a priority IPv6 was for them.
- **Google Fiber (Webpass MoCA)** deliberately doesn't support IPv6 over their MoCA delivery path.
- **T-Mobile Home Internet** provides no DHCPv6-PD, making it useless for segmented networks.
- **Ubiquiti's UniFi 5G Backup** ships with three firmware bugs that completely prevent IPv6 failover, and makes no attempt at IPv6 policy routing on the gateway side.

The common thread is clear: vendors treat IPv6 as optional. It isn't. Mobile carriers run IPv6 as their primary protocol. CDNs serve the majority of traffic over it. An increasing number of services prefer or require it. Treating IPv6 as a second-class citizen in 2026 is shipping broken products.

If you're running a UniFi setup with the U5G Backup and want working IPv6 failover, the [unifi-hacks](https://github.com/chriselsen/unifi-hacks) repo is a starting point. It's not a simple checkbox — configuring IPv6 failover without BGP at the residential level is genuinely complex engineering — but it works, and it's documented well enough to adapt to your own setup.

The vendors should be doing this for us. Until they do, we'll keep doing it ourselves.
