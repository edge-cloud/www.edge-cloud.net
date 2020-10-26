---
title: Multicast with AWS Transit Gateway
author: Christian Elsen
excerpt: Walkthrough for setup and testing IP Multicast with AWS Transit Gateway (TGW)
layout: single
permalink: /2020/05/01/tgw-multicast-intro/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

At the beginning of December 2019, AWS released [Multicast support](https://aws.amazon.com/blogs/aws/aws-transit-gateway-adds-multicast-and-inter-regional-peering/) within the [AWS Transit Gateway](https://aws.amazon.com/transit-gateway/). This marked the beginning of being able to use applications that require support for [IP Multicast](https://en.wikipedia.org/wiki/IP_multicast) within AWS.

The following article will give you a brief overview of how to use IP Multicast with the AWS Transit Gateway and especially how to validate that your setup is working correctly.

# Multicast

Let's have a look at the basics of IP Multicasting and IP Multicast on AWS.

## What is IP Multicasting

With IP Multicasting a source host can send a single packet to hundreds or thousands of hosts at the same time. All this works over a route network - e.g. the Internet. The replication of the source packet along with tracking of destination membership happens inside of the network itself, instead of the application (See Figure 1).

{% include figure image_path="/content/uploads/2020/05/Multicast-IPMulticast.png" caption="Figure 1: IP Multicasting with source host, rendezvous point and multicast receiver." %}

For this to work the source host addresses the packet with a Multicast Address from the range of 224.0.0.0 through 239.255.255.255. Each Multicast Address specifies a Multicast group to which other hosts can subscribe to. Such a group can have between one and an unlimited number of members as neither hosts nor routers maintain a list of all members. Instead the source host send the packet to an initial router, called the rendezvous point (RP), which serves as the root of a tree-like multicast distribution.
The most common [transport layer](https://en.wikipedia.org/wiki/Transport_layer) protocol to use multicast addressing is [User Datagram Protocol (UDP)](https://en.wikipedia.org/wiki/User_Datagram_Protocol).  


## Multicast and AWS Transit Gateway

While an AWS VPC by itself does not support Multicast, AWS Transit Gateway can provide this new capability. The Transit Gateway will act as the rendezvous point, receiving the packets from the Multicast source, replicate it and send it to the Multicast Receiver. With the Multicast-enabled Transit Gateway, source and receiver can be in the same VPC or in different VPCs.

# Constraints

Today Multicast on AWS Transit Gateway comes with a few restrictions that need to be considered:
 * Creation and usage of Multicast-enabled TGW is currently only supported in the AWS Region us-east-1 (N. Virginia).
 * You must create a new TGW to enable Multicast. It is not possible to enable Multicast on an existing Transit Gateway. In case you are already using a Transit Gateway, you can create another instance that will just serve the purpose of distributing Multicast traffic (See Figure 2). As neither VPC nor TGW route tables are used to handle multicast traffic, this deployment model will not interfere with your existing traditional TGW or VPC route tables.
 * Self-Management of Multicast group membership by hosts through the [Internet Group Management Protocol (IGMP)](https://en.wikipedia.org/wiki/Internet_Group_Management_Protocol) is not yet supported. Instead Multicast group membership is solely managed using Amazon VPC Console or the AWS CLI.
 * Only [AWS Nitro](https://aws.amazon.com/ec2/nitro/) instances can be a Multicast source. If you use a non-Nitro instance as a receiver, you must disable the [Source/Dest check](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#change_source_dest_check).
 * While the AWS Transit Gateway has a default limit of only supporting [1x TGW source per group](https://docs.aws.amazon.com/vpc/latest/tgw/transit-gateway-quotas.html#multicast-quota), this limit can be increased.

{% include figure image_path="/content/uploads/2020/05/Multicast-Multicast-TGW.png" caption="Figure 2: Multicast-enabled TGW besides traditional TGW." %}

# Setup

Before kicking the tires on Multicast, it needs to be setup. At a minimum this requires the network setup within the Transit Gateway, as well as at least one Multicast Source and one Multicast Receiver instance.  

## Source and Receiver Instances

First setup the EC2 instances that we will use in our testing as the Multicast Source and Multicast Receiver. To better understand how Multicast works, you should create at least one Multicast Source and two Multicast Receiver. Also keep the constraint around usage of AWS Nitro instances in mind and select a Nitro-based EC2 instance for the three EC2 instances.
This blog post will assume use of Ubuntu Linux instances for the EC2 instances and you should install [iPerf](https://iperf.fr/) on these instances. On Ubuntu Linux you will do this via ```sudo apt get install iperf```.

Last, but not least ensure that port UDP 5001 is opened within the [security group](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html) associated with the Multicast Receiver instances. The source IP will be the IPv4 address of the ENI associated with the Multicast Source EC2 instance.

## Transit Gateway (TGW)

You can follow the [AWS instructions](https://docs.aws.amazon.com/vpc/latest/tgw/working-with-multicast.html) for setting up a Multicast-enabled TGW, along with a multicast domain.
Next associate any of the VPCs and subnets that will include Multicast Sources and Receivers to this TGW. Multicast Source and Receiver can either be in the same VPC, or in different VPCs. Then associate the individual Multicast Sources and Receiver via their Elastic Network Interface (ENI) with a Multicast Group (See Figure 3).

{% include figure image_path="/content/uploads/2020/05/TGW-Multicast-Group.jpg" caption="Figure 3: Multicast-Group with single source and multiple receiver." %}

The above example shows the Multicast Group 224.1.1.1 with one Multicast Source and two Multicast Receivers.

# Testing

Now that the setup is complete, it's time to test our setup. We expect that a packet send by the Multicast Source to the Multicast group 224.1.1.1 should be simultaneously received by both Multicast Receivers.

## Multicast Receiver

First get the two Multicast Receiver ready by starting iPerf in "Server" mode against the Multicast group IP of "224.1.1.1" and using the protocol UDP. iPerf will use the default port of 5001.

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

iPerf will recognize the provided address as an IP Multicast address and join this group. After that iPerf will wait for incoming traffic over UDP port 5001 and display it accordingly.

## Multicast Source

Now that the Multicast Receiver are ready to accept traffic, it's time to get the Multicast Source ready. On the Multicast Source EC2 instance, we will start iPerf in client mode against the above Multicast group.

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

This way iPerf will generate traffic and send it to the Multicast group 224.1.1.1 over UDP to port 5001, which is the default setting.

## Result

While the Multicast Source is generating traffic, we can head over to the two Multicast Receiver instances. There we should notice that both of the instances are receiving the test traffic at the same time.  

```
...
[  3] local 224.1.1.1 port 5001 connected with 192.168.220.20 port 59347
[ ID] Interval       Transfer     Bandwidth        Jitter   Lost/Total Datagrams
[  3]  0.0- 1.0 sec   128 KBytes  1.05 Mbits/sec   0.035 ms    0/   89 (0%)
[  3]  1.0- 2.0 sec   128 KBytes  1.05 Mbits/sec   0.015 ms    0/   89 (0%)
[  3]  2.0- 3.0 sec   128 KBytes  1.05 Mbits/sec   0.025 ms    0/   89 (0%)
[  3]  0.0- 3.0 sec   386 KBytes  1.05 Mbits/sec   0.068 ms    0/  269 (0%)

```

As expected the underlying network replicated the test traffic from the Multicast Source and delivered it to both Multicast Receiver at the same time.

# Troubleshooting

Here are a few things to look at in case something is not working
 * **Security Groups and Firewalls:** Make sure that the Security Group associated with the Multicast Receiver EC2 instance allows the Multicast test traffic in. We will be using the transport protocol UDP and by default iPerf uses the port 5001. Also, the source IP of the received traffic will be the IPv4 address of the ENI that is the Multicast Source. In case you are using multiple Multicast Sources, this will translate to multiple IPv4 addresses.
 * **TGW Multicast Domain groups:** Make sure that the Multicast group IP address that you are using with iPerf matches the setup in TGW. Also make sure that you specified the correct EC2 instances - via their ENI - as the source and receiver.

 If things still don't work, fire up [tcpdump](https://www.tcpdump.org/) on the Source and Receiver side and see what packets you're seeing.  

# Summary

This article walked you through the setup and configuration of a Multicast-enabled Transit Gateway and showed you how to quickly test functionality using iPerf.
