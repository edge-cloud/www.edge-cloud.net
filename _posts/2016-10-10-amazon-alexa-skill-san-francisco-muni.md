---
id: 2288
title: Amazon Alexa Skill for San Francisco Muni
date: 2016-10-10T08:01:51+00:00
author: Christian Elsen
excerpt: An Amazon Alexa Skill for San Francisco Muni, that can be used with the Amazon Echo or FireTV
layout: single
permalink: /2016/10/10/amazon-alexa-skill-san-francisco-muni/
redirect_from: 
  - /2016/10/10/amazon-alexa-skill-san-francisco-muni/amp/
categories:
  - EdgeCloud
tags:
  - Alexa
  - Echo
toc: true
---
Alexa is the voice service that powers the [Amazon Echo](http://amzn.to/2dY24Fv) and provides capabilities, or skills, that enable users to interact with the device by using voice. Examples of built-in skills include the ability to play music, answer general questions, set an alarm or timer, and more.

But the real power of Alexa is the [Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit), which is a collection of self-service APIs, tools, documentation and code samples that make it fast and easy for you to add skills to Alexa.

This post will show you how to use the [NextBus](https://www.nextbus.com) [API](https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf) in an Alexa Skill to provide you information about [SF Muni](https://www.sfmta.com/)'s public transit options in San Francisco.

You will be able to use this Alexa skill from a standard [Amazon Echo](http://amzn.to/2dY24Fv) and [Echo Dot](http://amzn.to/2dZDjfE) device, but also from a [Fire TV](http://amzn.to/2dylDWL) device to ask for up to date transit options around you.

Once everything is up and running you will be able to ask your Echo device "Alexa, ask Muni for the next train" for which it will then e.g. reply with "The next metros are N in 6 minutes, KT in 9 minutes, and N in 16 minutes."

## Pre-Requisites

Before you get started, here is what you need:

  * An [Amazon Echo](http://amzn.to/2dY24Fv), [Echo Dot](http://amzn.to/2dZDjfE), or [Fire TV](http://amzn.to/2dylDWL) device to use your custom Alexa skill.
  * An [Amazon AWS](https://aws.amazon.com/) account, where you will use [AWS Lambda](https://aws.amazon.com/lambda/) to run the Alexa skill.
  * An [Amazon Developer account](https://developer.amazon.com/login.html) for creating your Alexa skill.

It is also highly recommended that you have used Amazon AWS before and that you have basic coding skills.

## Source code and customization

You can find all necessary source code for this custom skill on [GitHub](https://github.com/chriselsen/Alexa_NextMuni).

The *"src"* directory includes all necessary files for the AWS Lambda function, while the files in the directory *"speechAssets"* will be used for the Alexa Skill kit.

Keep in mind that the locations of the Muni stops for which this Alexa Skill provides updates is hard-coded. Before getting started you might therefore want to adapt the location of the Muni information to your specific location as my example uses the [San Francisco Caltrain station](https://en.wikipedia.org/wiki/San_Francisco_4th_and_King_Street_Station) at 4th & King as the location.

To do so, have a look at the file [index.js](https://github.com/chriselsen/Alexa_NextMuni/blob/master/src/index.js) first, which includes the function *"findMuniStop"* at the bottom:

    function findMuniStop(type,line,direction) {
		switch(line){
			case "N":
				var stopId = "&stops=N|5240";
				var typeName = "outbound N metros";
				break;
			case "KT":
			case "K":
				switch(direction){
					case "outbound":
						var stopId = "&stops=KT|7166";
						var typeName = "outbound KT metros";
						break;
					default:
						var stopId = "&stops=KT|7397";
						var typeName = "inbound KT metros";
				}
				break;
			case "30":
				var stopId = "&stops=30|7235";
				var typeName = "outbound 30 buses";
				break;
			case "45":
				var stopId = "&stops=45|7235";
				var typeName = "outbound 45 buses";
				break;
			case "10":
				var stopId = "&stops=10|6695";
				var typeName = "inbound 10 buses";
				break;
			case "82":
			case "82X":
			case "82 express":
				var stopId = "&stops=82X|3164";
				var typeName = "inbound 82X buses";
				break;
			default:
				switch(type){
					case "bus":
					case "buses":
						var stopId = "&stops=30|7235&stops=45|7235";
						var typeName = "buses";
					break;
					default:
						var stopId = "&stops=N|5240&stops=KT|7166";
						var typeName = "metros";						
				}
		}

		return [stopId, typeName];
    }


In my case I'm interested in the metro lines N and KT, as well as the buses 30, 45, 10, and 82X. Also I have a set of stops set as default value, when not specifying a mode of transportation or line. Change the lines and stops according to your needs.

You can lookup the SF Muni stop IDs via the NextBus API, e.g. for the [K/T line](http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=KT).

Also, you will also need to update the custom slot types for [TRANSIT_LINE](https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/customSlotTypes/TRANSIT_LINE) in the *"speechAssets"* directory with your Muni lines.

## Creating the AWS Lambda Function for a Custom Skill

First you need to create the AWS Lambda Function for your custom skill in Amazon AWS. Refer to the Alexa documentation [Creating an AWS Lambda Function for a Custom Skill](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function) for a detailed walk through of this process.

Below you can find a brief walk through for the necessary steps

Go to the [AWS Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/) and click on the Lambda service link. Ensure you are in US-East (N. Virgina) as Alexa can only use Lambda in this US AWS region.

Click on the Create a Lambda Function or Get Started Now button. When presented with sample blueprints, choose **Skip**.

Under *Configure Triggers* select the **Alexa Skills Kit** and click on **Next** (See Figure 1).

{% include figure image_path="/content/uploads/2016/10/Muni01.png" alt="Figure 1: Alexa Skills Kit as AWS Lambda trigger" caption="Figure 1: Alexa Skills Kit as AWS Lambda trigger" %}

Combine the content of the [src](https://github.com/chriselsen/Alexa_NextMuni/tree/master/src) folder into a ZIP file. Make sure that the ZIP file does not contain the *"src"* directory itself, but instead the files *"AlexaSkill.js"* and *"index.js"* need to be at the root level of the ZIP archive.

Name the Lambda Function *"Alexa\_MuniMetro\_Skill"* and provide a description if wanted. Keep the Runtime as *"Node.js 4.3"* and upload the previously created ZIP file.

Keep the Handler as *"index.handler"*, which refers to the main js file in the ZIP archive (See Figure 2).

{% include figure image_path="/content/uploads/2016/10/Muni02.png" alt="Figure 2: Create an AWS Lambda function" caption="Figure 2: Create an AWS Lambda function" %}

Create via a *"custom role"* a **basic execution role** for Lambda, which will have the following policy by default:

    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource": "arn:aws:logs:*:*:*"
        }
      ]
    }

Leave all other settings as default, click **Next** and afterwards **Create function** (See Figure 3).

{% include figure image_path="/content/uploads/2016/10/Muni03.png" alt="Figure 3: AWS Lambda function for Alexa Skill" caption="Figure 3: AWS Lambda function for Alexa Skill" %}

After the Lambda function has been created successfully, note down the ARN, which is later needed in the Alexa skill setup (See Figure 4).

{% include figure image_path="/content/uploads/2016/10/Muni04.png" alt="Figure 4: ARN of the AWS Lambda function" caption="Figure 4: ARN of the AWS Lambda function" %}

This complete the creation of the AWS Lambda function.

## Setting up the custom Alexa Skill

Next we will need to setup a custom Alexa Skill that interacts with the AWS Lambda function above. For this login to your [Amazon Developer Account](https://developer.amazon.com/edw/home.html#/skills/list) and navigate to the Alexa Skills Kit section.

Add a New Skill. Leave the *Language* and *Skill Type* at the default value. Set **Next Muni Bus or Metro** as the skill name and **muni** as the invocation name (See Figure 5).

The *Invocation Name* is what is used to activate this particular skill. For example you would say: "Alexa, ask Muni when the next bus is coming."
{: .notice}

Click **Next** to go the next screen.

{% include figure image_path="/content/uploads/2016/10/Muni05.png" alt="Figure 5: Create a new Alexa Skill" caption="Figure 5: Create a new Alexa Skill" %}

Next you have to provide information for the voice interaction model. You can find all these information within the [*speechAssets*](https://github.com/chriselsen/Alexa_NextMuni/tree/master/speechAssets).

First create the three custom slot types **TRANSIT\_DIRECTION**, **TRANSIT\_LINE**, and **TRANSIT_TYPE** and fill them with the information from the [customSlotTypes](https://github.com/chriselsen/Alexa_NextMuni/tree/master/speechAssets/customSlotTypes) folder.

Next, copy the content of [IntentSchema.json](https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/IntentSchema.json) into the **Intent Schema** and the content of [SampleUtterances.txt](https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/SampleUtterances.txt) into the **Sample Utterances** field.

Click **Next** to go to the next screen (See Figure 6).

{% include figure image_path="/content/uploads/2016/10/Muni06.png" alt="Figure 6: Voice interaction model" caption="Figure 6: Voice interaction model" %}

Chose **Lambda** as the **Service Endpoint Type** and specify the ARN to be in **North America**. Next copy the ARN for the Lambda function that you previously created into the field (See Figure 7).

Leave the **Account Linking** as is and click **Next*.

{% include figure image_path="/content/uploads/2016/10/Muni07.png" alt="Figure 7: AWS Lambda as service endpoint" caption="Figure 7: AWS Lambda as service endpoint" %}

Make sure that your skill is enabled for testing on your account (See Figure 8). This will allow you to use this skill in your account without having to publish it.

Before invoking your Echo or Fire TV device, you can also use the *Service Simulator* to test your skill: In the *Enter Utterence* field enter **for the next train** and click on **Ask Next Muni Bus or Metro**.

You will see the request that is send off to Lambda, as well as the response received from Lambda. If everything is working correctly you should an answer like "The next metros are N in 6 minutes, KT in 9 minutes, and N in 16 minutes." (See Figure 8).

{% include figure image_path="/content/uploads/2016/10/Muni08.png" alt="Figure 8: Test your Alexa Skill" caption="Figure 8: Test your Alexa Skill" %}

Don't fill out the sections *Publishing Information* and *Privacy & Compliance*, as you cannot submit this skill for Certification. Instead only you can use it from your account.

You are now able to start using the skill on your device! You can also go to your Echo companion webpage [http://echo.amazon.com/#skills](http://echo.amazon.com/#skills) and see the skill enabled.

## Using the Alexa Skill

There are two main capabilities that this Alexa Skill will provide you:

  * **Ask for the next bus or metro.** The Alexa Skill will tell you the next three connections from a pre-configured stop ID. If there is a system notification, it will warn you about it as well.
  * **Ask if there is a system notification.** The Alexa Skill will reply with the system messages that are of priority *High*. These usually refer to service outages or impactes and don't include "Elevator outages".

Here are some examples on what you can ask the Alexa Skill about:

Q: "Alexa, ask Muni when the next metros are coming.";  
A: "The next metros are N in 1 minute, KT in 6 minutes, and N in 9 minutes.";
{: .notice}

Q: "Alexa, ask Muni for the next 45."  
A: "The next outbound 45 buses are 45 in 5 minutes, 45 in 17 minutes, and 45 in 32 minutes."
{: .notice}

Q: "Alexa, ask Muni for the next inbound 10."  
A: "The next inbound 10 buses are 10 in 3 minutes, 10 in 21 minutes, and 10 in 34 minutes."
{: .notice}

Q: "Alexa, ask Muni if there is a problem with the 45 bus."  
A: "There is currently no service message for the outbound 45 buses."
{: .notice}

## Limitations

Please keep in mind that the prediction data for the next buses and metros, but also the service messages come from [NextBus](https://www.nextbus.com) via their [API](https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf). The service messages are provided by [SF Muni](https://www.sfmta.com/) to NextBus.

Unfortunately providing these service messages to NextBus is a manual step for Muni, which means that it is very frequently forgotten. Therefore the Alexa Skill might happily tell you "There is currently no service message for the metros.", while reality looks quite different (See Figure 9).

{% include figure image_path="/content/uploads/2016/10/2016-03-07-08.53.42.jpg" alt="Figure 9: SF Muni Metro service interruption" caption="Figure 9: SF Muni Metro service interruption" %}

Also predictions for buses and metros at the beginning of a line - which is the case of the N, 30 and 45 in my case - are rather less reliable.

## Summary

This post showed you how to create your own custom Amazon Alexa Skill to get next bus and next metro information for San Francisco's Muni. You can use this custom Alexa Skill with an Amazon Echo or Fire TV device.
