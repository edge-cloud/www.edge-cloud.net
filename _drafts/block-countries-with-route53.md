---
title: Block access from certain countries with Route 53
author: Christian Elsen
excerpt: Use Amazon Route 53 Geolocation Routing to block access to services from certain countries. Leverage RIPE Atlas to validate the setup.
layout: single
permalink: /2019/12/06/block-countries-with-route53/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

This article walks you through using [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo), in order to block access to services from certain countries. In addition [RIPE Atlas](https://atlas.ripe.net/) is used in a subsequent step to validate the setup.

# Configuration setup

## Route 53 Geolocation routing

## Error page using CloudFront and S3

# Testing the Setup

## RIPE Atlas

[RIPE Atlas](https://atlas.ripe.net/) is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects on your Internet connection, but it will also allow you to run customized measurements against various Internet targets. And in the end every additional RIPE Atlas probe will benefit the overall Internet community.

```
#!/usr/bin/env python3

from ripe.atlas.sagan import Result
from ripe.atlas.cousteau import Probe

my_results_file = "./RIPE-Atlas-measurement-fraq.json"
with open(my_results_file) as results:
    for result in results.readlines():
        parsed_result = Result.get(result)
        probe = Probe(id=parsed_result.probe_id)
        probe_country = probe.country_code
        probe_id = parsed_result.probe_id
        try:
            probe_result = parsed_result.responses[0].abuf.answers[0].address
        except:
            probe_result = "None"
        status = "Not OK <===="
        if (probe_country == "CN" and probe_result == "China"):
            status = "OK"
        if (probe_country != "CN" and probe_result == "Default"):
            status = "OK"
        if (probe_result == "None"):
            status = "Unknown"

        print(probe_country + ": " + str(probe_id) + ": " + probe_result + ": " + status)
```


## Heading 1.1

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```

{% include figure image_path="/content/uploads/2019/07/EC2-Based-Router-BGP.png" caption="Figure 1: Setup Overview of EC2-based VPN endpoint for Site-to-Site VPN with AWS" %}
