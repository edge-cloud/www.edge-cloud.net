---
title: Freeradius with Let's Encrypt certificate for WPA Enterprise (802.1x) WiFi setup
author: Christian Elsen
excerpt: Step-by-step guid to setup Freeradius 3.0 with Let's Encrypt certificates to implement a WPA Enterprise (802.1x) Wifi setup with EAP-TTLS for BYOD.
layout: single
permalink: /2019/04/30/freeradius-with-letsencrypt-for-wpa-enterprise/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish

# Setup

## Kerberos

**/etc/krb5.conf**
```
#
# /etc/krb5.conf
#

[libdefaults]
 default_realm = DOMAIN.LOCAL

# EoF
```

## Samba

**/etc/samba/smb.conf**
```
#
# /etc/samba/smb.conf
#

# start of global variables
[global]

# server information, this is the domain/workgroup
workgroup = DOMAIN

# Kerberos / authentication information
realm = DOMAIN.LOCAL

# system hostname
netbios name = RADIUS1

# security used (Active Directory)
security = ADS

# EoF
```

**/etc/hosts**
```
127.0.0.1    radius1.domain.local radius1 localhost.localdomain localhost
```

# Join the domain

# Let's Encrypt

# Freeradius

# Testing
