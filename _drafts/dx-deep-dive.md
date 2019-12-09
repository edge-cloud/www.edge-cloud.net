---
title: AWS Direct Connect deep dive
author: Christian Elsen
excerpt: Deep dive look at AWS Direct Connect
layout: single
permalink: /2019/12/13/dx-deep-dive/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish

# Heading 1

## Heading 1.1

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```

| |Dedicated Connections|Hosted Connections|Hosted Virtual Interfaces|
|---|---|---|---|
|**AWS asigned capacity**|1 Gbps or 10 Gbps|50 Mbps to 10 Gbps|None|
|**Private or Public Virtual Interfaces (VIFs)**|50|1|1|
|**Transit Virtual Interface (VIF)**|1|1 (if assigned capacity >= 1 Gbps)|None|

{% include figure image_path="/content/uploads/2019/12/DX-VIFs-Overview.png" caption="Figure 1: Direct Connect Overview" %}

{% include figure image_path="/content/uploads/2019/12/DX-Cross-Connect.png" caption="Figure 2: Direct Connect Cross Connect" %}

{% include figure image_path="/content/uploads/2019/12/DX-Connectivity.png" caption="Figure 3: Direct Connect Connectivity Options" %}
