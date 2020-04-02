---
title: Introduction to Multicast with AWS Transit Gateway
author: Christian Elsen
excerpt: Walkthrough for testing IP Multicast with AWS Transit Gateway (TGW)
layout: single
permalink: /2020/02/21/tgw-multicast-into/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Released Dec 3rd, 2019 https://aws.amazon.com/blogs/aws/aws-transit-gateway-adds-multicast-and-inter-regional-peering/


IP Multicast https://en.wikipedia.org/wiki/IP_multicast

Intro of what to accomplish

# Multicast

## Multicast and AWS Transit Gateway

# Setup

## Transit Gateway (TGW)

## Sender and Receiver Instances

# Testing

## Multicast Receiver

```
% iperf -s -u -B 224.1.1.1 -i 1
------------------------------------------------------------
Server listening on UDP port 5001
Binding to local address 224.1.1.1
Joining multicast group  224.1.1.1
Receiving 1470 byte datagrams
UDP buffer size:  110 KByte (default)
------------------------------------------------------------
```

## Multicast Sender

```
% iperf -c 224.1.1.1 -u -T 32 -t 3 -i 1
------------------------------------------------------------
Client connecting to 224.1.1.1, UDP port 5001
Sending 1470 byte datagrams
Setting multicast TTL to 32
UDP buffer size:  110 KByte (default)
------------------------------------------------------------
[  3] local 192.168.220.20 port 59347 connected with 224.1.1.1 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0- 1.0 sec   129 KBytes  1.06 Mbits/sec
[  3]  1.0- 2.0 sec   128 KBytes  1.05 Mbits/sec
[  3]  2.0- 3.0 sec   128 KBytes  1.05 Mbits/sec
[  3]  0.0- 3.0 sec   386 KBytes  1.05 Mbits/sec
[  3] Sent 269 datagrams

```


## Result

```
...
[  3] local 224.1.1.1 port 5001 connected with 192.168.220.20 port 59347
[ ID] Interval       Transfer     Bandwidth        Jitter   Lost/Total Datagrams
[  3]  0.0- 1.0 sec   128 KBytes  1.05 Mbits/sec   0.035 ms    0/   89 (0%)
[  3]  1.0- 2.0 sec   128 KBytes  1.05 Mbits/sec   0.015 ms    0/   89 (0%)
[  3]  2.0- 3.0 sec   128 KBytes  1.05 Mbits/sec   0.025 ms    0/   89 (0%)
[  3]  0.0- 3.0 sec   386 KBytes  1.05 Mbits/sec   0.068 ms    0/  269 (0%)

```

# Summary

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```

{% include figure image_path="/content/uploads/2020/01/SecuringYourAWSNetwork.png" caption="Figure 1: Setup Overview of EC2-based VPN endpoint for Site-to-Site VPN with AWS" %}
