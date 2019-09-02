---
title: AWS Direct Connect Deep Dive
author: Christian Elsen
excerpt: A deep dive look into the AWS Direct Connect Gateway
layout: single
permalink: /2019/09/05/dx-gateway-deep-dive/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish

# Use Cases

## Direct Connect to remote regions

{% include figure image_path="/content/uploads/2019/09/DX-Associated-Region.png" caption="Figure 1: Direct Connect with associated AWS region." %}

{% include figure image_path="/content/uploads/2019/09/DX-with-DXGW.png" caption="Figure 2: Direct Connect with Direct Connect Gateway." %}

## AWS Transit Gateway with Direct Connect

{% include figure image_path="/content/uploads/2019/09/DXGW-with-TGW.png" caption="Figure 3: Direct Connect Gateway with Transit Gateway." %}

# Attachments and associations

## Virtual Interface Attachments

* **Private Virtual interface:**
* **Transit Virtual Interface:**

## Gateway associations

* **Virtual Private Gateway:**
* **Transit Gateway:**

# Multi-Account support

{% include figure image_path="/content/uploads/2019/09/DXGW-Owner.png" caption="Figure 4: Possible account ownership in multi-account setup." %}

# Restrictions and Limits

## Object Limits

* **Virtual Interfaces:**
* **Transit Gateways:**
* **Virtual Private Gateways:**

## Data flow

{% include figure image_path="/content/uploads/2019/09/DXGW-DataFlow.png" caption="Figure 5: Permitted data flow (green) and not permitted data flow (red) with Direct Connect Gateway." %}

## BGP prefixes

{% include figure image_path="/content/uploads/2019/09/DXGW-BGP-Limits.png" caption="Figure 6: BGP prefix limits with Direct Connect Gateway." %}

# Summary
