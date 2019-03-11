---
title: 'Software Defined Data Center (SDDC) Architecture - Introduction'
date: 2015-02-20T17:05:15+00:00
author: Christian Elsen
layout: single
permalink: /2015/02/20/sddc-architecture-introduction/
redirect_from:
  - /2015/02/20/sddc-architecture-introduction/amp/
  - /2015/02/sddc-architecture-introduction/
  - /2015/02/20/sddc-architecture-
categories:
  - EdgeCloud
tags:
  - Architecture
  - Cloud
  - SDDC
toc: true
---
A Software Defined Data Center (SDDC) is a vision for a new IT infrastructure that applies virtualization concepts such as abstraction, pooling, and automation to all resources of a data center. It promises to improve the delivery, operation, and recovery of Business Applications through increased agility and performance, while reducing service delivery times.

Creating and executing a strategy to realize this vision is a journey that needs to include not only new technology, but also changed processes as well as people with new training and mindsets.

In a series of articles I want to focus on the architecture and some of its design elements for a SDDC. This first article will focus on the requirements of an SDDC, before attempting to break up the problem into manageable "chunks" and address them in a divide-and-conquer fashion in subsequent posts.

Although the presented problem statement, architecture and design could apply to a wide variety of products, I will mostly focus on products from VMware and its eco-system partners. Also while the presented architecture and design might not necessarily exist in its entire form at a customer site today, individual elements presented have certainly proven it's success as part of numerous customer projects.

# Requirements

A Software Defined Data Center promises to be the new underpinning or platform for delivering today's and tomorrow's IT services. As such this next generation infrastructure needs to address some shortcomings of today's infrastructure in order to be successful:

* **Highly automated operation at Scale:** Leaner organization that scales sub-linearly with an operating model build around automation. Leverage modular web-scale designs for unhampered scalability.
* **Hardware and Software efficiencies:** Support on-demand scaling for varying capacity needs. Improved resource pooling to drive increased utilization of resources and reduce cost.
* **New and old business needs:** Support legacy applications with traditional business continuity and disaster recovery, besides new cloud-native applications.

Throughout the architecture and design discussion I will attempt to provide traceability between the design decisions and these requirements. Therefore let's look into each of these requirements in more detail:

## Highly automated operation at Scale

Today's IT departments are pressed to do more with less and provide IT services at a high quality and a lower cost. Doing so, IT departments often have to compete with outside services ranging from public clouds such as [Amazon Web Services (AWS)](https://aws.amazon.com/) for Infrastructure services, all the way to [Office 365](https://products.office.com/en-us/business/) for SaaS based offerings. And if IT departments are successful with their internal offerings, they need to ensure that they can scale up in a reasonable time-frame to meet the new demand.

To deliver on this requirement one will quickly discover that it is necessary to use a strong foundation of automation to provide a swift and reliable infrastructure that can easily scale up and provide offered services. Adding more headcount to accomplish this task is not an option as it would not only lead to increased cost, but also to largely unpredictable outcomes due to human errors in the scaled operations.

Last but not least, in order to compete with the abilities and the price of web-scale services such as AWS, IT departments need to leverage some of their design elements to achieve similar unhampered scale at a reasonable price point.

## Hardware and Software efficiencies

The traditional approach to data centers was often a combination of one-size fits all - for simplifying operations - as well as best-is-just-good-enough - due to the requirement of running mission critical workloads. While the requirement for reliability doesn't go away, new and old business needs (see next section) have more differentiated requirements for business continuity and disaster recovery. This offers the possibility to shift certain capabilities around availability from hardware to software or even give up on them altogether within the infrastructure. Let the application itself deal with failures.

One of the corner stones of a Software Defined Data Center is the introduction of virtualization for not only compute, but also networking - known as Software Defined Networking (SDN), and storage - known as Software Defined Storage (SDS). This allows the tear-down of resource silos, allow resource pooling and thereby the reduction of costs.

## New and old business needs

An IaaS cloud such as AWS is geared towards a cloud application model, with cloud native applications. These applications implement mechanism to cope with environment-induced failures within the application itself instead of leveraging hardware or platform redundancy. While we want to also support these cloud native applications in an SDDC, the vast majority of enterprise applications are still traditional applications that are not optimized for such a cloud model. The SDDC shall therefore especially provide a home for these legacy applications, while at the same time offering some of the benefits of cloud computing, such as automation and self-service.

# High-level Architecture for a Software Defined Data Center (SDDC)

Next we will break up the design of a Software Defined Data Center (SDDC) into manageable "chunks" and address them in a divide-and-conquer fashion in subsequent posts. To do so, the SDDC is split into three main layers, along with capabilities spanning all three layers (See Figure 1).

{% include figure image_path="/content/uploads/2015/02/SDDC_Layers.png" caption="Figure 1: Architecture Overview of a Software Defined Data Center" %}

The main layers are:

* **Physical Layer:** This includes the physical compute, network and storage components.
* **Virtual Infrastructure Layer:** This layer includes the traditional virtualization platform with the hypervisor, resource pooling and virtualization control. VMware products falling in this category are [vSphere](http://www.vmware.com/products/vsphere.html) and [NSX](http://www.vmware.com/products/nsx.html).
* **Cloud Management Layer:** This layer adds capabilities to the Virtual Infrastructure Layer, bringing capabilities known from IaaS clouds to the SDDC. These capabilities include service catalogs, self-service portals and an orchestration engine. VMware products in this layer are [vRealize Automation](http://www.vmware.com/products/vrealize-automation.html)</a> (formerly vCloud Automation Center), [vCloud Director](http://www.vmware.com/products/vcloud-director.html) or VMware Integrated OpenStack (VIO)(http://www.vmware.com/products/openstack.html), along with [vRealize Orchestrator](http://www.vmware.com/products/vrealize-orchestrator.html) (formerly vCenter Orchestrator).

Additional capabilities that span across these main layers are:

* **Service Management:** The ability to manage the entire SDDC via a single pane of glass, including operations management and portfolio management for offered services. VMware products in this layer are [vRealize Operations](http://www.vmware.com/ap/products/vrealize-operations.html) (Formerly vCenter Operations Management Suite).
* **Business Continuity:** The ability to provide business continuity for the SDDC itself, but especially the hosted workloads. This includes the fault tolerance of SDDC components, backup & recovery of data and services as well as data replication. Products from the VMware eco-system are [Veeam Backup & Replication](https://www.veeam.com/vmware-esx-backup.html) or [Zerto Business Continuity & Disaster Recovery](http://www.zerto.com/).
* **Security:** Provide security mechanism for governance, risk mitigation and compliance. Products from the VMware eco-system are [HyTrust](http://www.hytrust.com/) Cloudcontrol and Datacontrol

We will need to address these capabilities in each of the layers.

# Summary

This article is the foundation for a series of further articles in which we will together embark the journey to let the vision of a software defined data center come true through an architecture with specific design elements. After outlining the requirements to be fulfilled by this architecture, the above outlined high-level SDDC architecture also provides an outline for future articles.

By reducing the complexity of the SDDC, we can also reduce the risk of the entire project and thereby increase the likelihood of achieving the desired return on investment.

# Posts in this series

Within the Physical Layer we want to look at these design artifacts:

* [**What is a validated design?:**](http://www.vmware.com/solutions/software-defined-datacenter/validated-designs.html) Explains what the VMware Validated Design is and why it is useful.
* [**Basic Design Elements:**](/2015/08/04/sddc-sddc-architecture-basic-design-elements/) Introduces the 5 basic design elements of the SDDC with Layered logical model, POD / Core concept, L3 Spine / Leaf network, Management Applications Network Container, and Service Level tiers.
* [**Core and POD Design:**](/2015/03/10/sddc-architecture-core-pod/) POD (Point-of-Delivery) as an atomic building block of Data Center resources, connected to a CLOS network for increased scale, agility, flexibility and resilience.
* [**Availability Zones and Regions:**](/2015/07/31/sddc-architecture-regions-and-availability-zones-azs/) Provide continuous availability of the SDDC, minimize unavailability of services and improve SLAs via Availability Zones, while using Regions to improve locality of SDDC resources towards end-users.
* [**Virtual PODs for Management applications:**](/2015/08/31/sddc-architecture-vpods-for-management-applications/) The Virtual POD network container is a very powerful, yet simple concept to provide the management applications of the SDDC with security, modularity, simplicity, improved BC/DR capabilities and IPv6 support. All this with a minimum of integration effort.
* [**Mapping of Logical Components to Physical Location:**](/2015/09/09/sddc-architecture-mapping-of-logical-components-to-physical-location/) Mapping of the logical components of the Software Defined Data Center to the underlying physical components. Mapping of vCenter Server to Platform Service Controllers.
* [**Business Continuity with multiple regions:**](/2015/09/11/sddc-architecture-business-continuity-with-multiple-regions/) Providing Business Continuity and Disaster Recovery (BC/DR) capabilities to the SDDC itself across multiple regions.
* [**Disaster Avoidance with multiple Availability Zones (AZs):**](/2015/07/31/sddc-architecture-regions-and-availability-zones-azs/) Using multiple Availability Zones (AZs) to prevent downtime and exercise Disaster Avoidance.
