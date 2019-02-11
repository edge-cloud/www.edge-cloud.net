---
title: How AT&T broke my IPv6 Internet connection
author: Christian Elsen
excerpt: Using RIPE Atlas to show how AT&T broke IPv6 on my home Internet connection.
layout: single
permalink: /2019/02/15/how-att-broke-my-ipv6/
categories:
  - EdgeCloud
tags:
  - IPv6
  - Network
toc: true
---

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_Warning.png" caption="Figure 1: RIPE Atlas showing that IPv6 isn't working properly" %}

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Fail.png" caption="Figure 2: Tests to Root DNS server over IPv6 failing while IPv4 is working" %}

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown.png" caption="Figure 3: Pin-pointing the date and time of the failure" %}

{% include figure image_path="/content/uploads/2019/02/ATT_Broken.png" caption="Figure 4: Traceroute to Google's Public DNS on broken AT&T connection" %}

{% include figure image_path="/content/uploads/2019/02/ATT_Working.png" caption="Figure 5: Traceroute to Google's Public DNS on working AT&T connection" %}

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown_MultYears.png" caption="Figure 6: RTT to A-Root Server over IPv6 over 3 years" %}

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown_MultYears_IPv4.png" caption="Figure 7: RTT to A-Root Server over IPv4 over 3 years" %}
