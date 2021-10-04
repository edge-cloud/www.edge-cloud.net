---
title: Title goes here
author: Christian Elsen
excerpt: Brief description goes here
layout: single
permalink: /2021/01/01/tgw-ngw-cost-breakeven/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
use_math: true
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

{% include figure image_path="/content/uploads/2020/01/SecuringYourAWSNetwork.png" caption="Figure 1: Setup Overview of EC2-based VPN endpoint for Site-to-Site VPN with AWS" %}



$$
   Price_{NGW}=( 720 hr / month \cdot Num_{VPC} \cdot Cost_{NGW-Attachment} ) + (traffic \cdot Cost_{NGW-Traffic})
$$


$$
  Price_{TGW+NGW}=
  ( 720 hr / month \cdot Num_{VPC} \cdot Cost_{TGW-Attachment} ) + \\
  ( 720 hr / month \cdot Num_{AZ} \cdot Cost_{NGW-Attachment} ) + \\
  (traffic \cdot ( Cost_{TGW-Traffic} + Cost_{NGW-Traffic}))
$$

$$
  Price_{TGW+NGW} \leq Price_{NGW}
$$

$$
  ( 720 hr / month \cdot Num_{VPC} \cdot Cost_{TGW-Attachment} ) + \\
  ( 720 hr / month \cdot Num_{AZ} \cdot Cost_{NGW-Attachment} ) + \\
  (traffic \cdot ( Cost_{TGW-Traffic} + Cost_{NGW-Traffic})) \\
  \leq ( 720 hr / month \cdot Num_{VPC} \cdot Cost_{NGW-Attachment} ) + (traffic \cdot Cost_{NGW-Traffic})  
$$

$$
  traffic \cdot Cost_{TGW-Traffic} +  traffic \cdot Cost_{NGW-Traffic} - traffic \cdot Cost_{NGW-Traffic} \\
  \leq ( 720 hr / month \cdot Num_{VPC} \cdot Cost_{NGW-Attachment} ) - \\
  ( 720 hr / month \cdot Num_{VPC} \cdot Cost_{TGW-Attachment} ) - \\
  ( 720 hr / month \cdot Num_{AZ} \cdot Cost_{NGW-Attachment} )
$$

$$
  traffic \cdot Cost_{TGW-Traffic} \\
  \leq 720 hr / month \cdot (( Num_{VPC} \cdot Num_{AZ} \cdot Cost_{NGW-Attachment} ) \\
  - ( Num_{VPC} \cdot Cost_{TGW-Attachment} ) - ( Num_{AZ} \cdot Cost_{NGW-Attachment} ))
$$


$$
  traffic \leq \frac{720 hr / month}{Cost_{TGW-Traffic}} \cdot \\
  (( Num_{VPC} \cdot Num_{AZ} \cdot Cost_{NGW-Attachment} ) - \\
  ( Num_{VPC} \cdot Cost_{TGW-Attachment} ) - ( Num_{AZ} \cdot Cost_{NGW-Attachment} ))
$$
