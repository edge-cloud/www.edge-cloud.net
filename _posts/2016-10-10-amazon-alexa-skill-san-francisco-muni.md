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
---
Alexa is the voice service that powers the <a href="http://amzn.to/2dY24Fv" target="_blank">Amazon Echo</a> and provides capabilities, or skills, that enable users to interact with the device by using voice. Examples of built-in skills include the ability to play music, answer general questions, set an alarm or timer, and more.

But the real power of Alexa is the <a href="https://developer.amazon.com/alexa-skills-kit" target="_blank">Alexa Skills Kit</a>, which is a collection of self-service APIs, tools, documentation and code samples that make it fast and easy for you to add skills to Alexa.

This post will show you how to use the <a href="https://www.nextbus.com" target="_blank">NextBus</a> <a href="https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf" target="_blank">API</a> in an Alexa Skill to provide you information about <a href="https://www.sfmta.com/" target="_blank">Muni</a>&#8216;s public transit options in San Francisco.

You will be able to use this Alexa skill from a standard <a href="http://amzn.to/2dY24Fv" target="_blank">Amazon Echo</a> and <a href="http://amzn.to/2dZDjfE" target="_blank">Echo Dot</a> device, but also from a <a href="http://amzn.to/2dylDWL" target="_blank">Fire TV</a> device to ask for up to date transit options around you.

Once everything is up and running you will be able to ask your Echo device &#8220;Alexa, ask Muni for the next train&#8221; for which it will then e.g. reply with &#8220;The next metros are N in 6 minutes, KT in 9 minutes, and N in 16 minutes.&#8221;

## Pre-Requisites

Before you get started, here is what you need:

  * An <a href="http://amzn.to/2dY24Fv" target="_blank">Amazon Echo</a>, <a href="http://amzn.to/2dZDjfE" target="_blank">Echo Dot</a>, or <a href="http://amzn.to/2dylDWL" target="_blank">Fire TV</a> device to use your custom Alexa skill.
  * An <a href="https://aws.amazon.com/" target="_blank">Amazon AWS</a> account, where you will use <a href="https://aws.amazon.com/lambda/" target="_blank">AWS Lambda</a> to run the Alexa skill.
  * An <a href="https://developer.amazon.com/login.html" target="_blank">Amazon Developer account</a> for creating your Alexa skill.

It is also highly recommended that you have used Amazon AWS before and that you have basic coding skills.

## Source code and customization

You can find all necessary source code for this custom skill at: <a href="https://github.com/chriselsen/Alexa_NextMuni" target="_blank">https://github.com/chriselsen/Alexa_NextMuni</a>.

The &#8220;_src_&#8221; directory includes all necessary files for the AWS Lambda function, while the files in the directory &#8220;_speechAssets_&#8221; will be used for the Alexa Skill kit.

Keep in mind that the locations of the Muni stops for which this Alexa Skill provides updates is hard-coded. Before getting started you might therefore want to adapt the location of the Muni information to your specific location as my example uses the <a href="https://en.wikipedia.org/wiki/San_Francisco_4th_and_King_Street_Station" target="_blank">San Francisco Caltrain station</a> at 4th & King as the location.

To do so, have a look at the file <a href="https://github.com/chriselsen/Alexa_NextMuni/blob/master/src/index.js" target="_blank">index.js</a> first, which includes the function &#8220;_findMuniStop_&#8221; at the bottom:

<pre>function findMuniStop(type,line,direction) {
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
</pre>

In my case I&#8217;m interested in the metro lines N and KT, as well as the buses 30, 45, 10, and 82X. Also I have a set of stops set as default value, when not specifying a mode of transportation or line. Change the lines and stops according to your needs.

You can lookup the SF Muni stop IDs via the NextBus API at e.g. <a href="http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&#038;a=sf-muni&#038;r=KT" target="_blank">http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=KT</a> for the K/T line.

Also, you will also need to update the custom slot types for <a href="https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/customSlotTypes/TRANSIT_LINE" target="_blank">TRANSIT_LINE</a> in the &#8220;_speechAssets_&#8221; directory with your Muni lines.

## Creating the AWS Lambda Function for a Custom Skill

First you need to create the AWS Lambda Function for your custom skill in Amazon AWS. Refer to the Alexa documentation &#8220;<a href="https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function" target="_blank">Creating an AWS Lambda Function for a Custom Skill</a>&#8221; for a detailed walk through of this process.

Below you can find a brief walk through for the necessary steps

Go to the <a href="https://console.aws.amazon.com/lambda/home?region=us-east-1#/" target="_blank">AWS Console</a> and click on the Lambda service link. Ensure you are in US-East (N. Virgina) as Alexa can only use Lambda in this US AWS region.

Click on the Create a Lambda Function or Get Started Now button. When presented with sample blueprints, choose &#8220;Skip&#8221;.

Under &#8220;Configure Triggers&#8221; select the &#8220;Alexa Skills Kit&#8221; and click on &#8220;Next&#8221; (See Figure 1).

<div id="attachment_2292" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni01.png"><img src="/content/uploads/2016/10/Muni01-600x221.png" alt="Figure 1: Alexa Skills Kit as AWS Lambda trigger" width="600" height="221" class="size-large wp-image-2292" srcset="/content/uploads/2016/10/Muni01-600x221.png 600w, /content/uploads/2016/10/Muni01-350x129.png 350w, /content/uploads/2016/10/Muni01-768x283.png 768w, /content/uploads/2016/10/Muni01.png 923w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: Alexa Skills Kit as AWS Lambda trigger
  </p>
</div>

Combine the content of the folder <a href="https://github.com/chriselsen/Alexa_NextMuni/tree/master/src" target="_blank">https://github.com/chriselsen/Alexa_NextMuni/tree/master/src</a> into a ZIP file. Make sure that the ZIP file does not contain the &#8220;src&#8221; directory itself, but instead the files &#8220;AlexaSkill.js&#8221; and &#8220;index.js&#8221; need to be at the root level of the ZIP archive.

Name the Lambda Function “Alexa\_MuniMetro\_Skill” and provide a description if wanted. Keep the Runtime as &#8220;Node.js 4.3&#8221; and upload the previously created ZIP file.

Keep the Handler as &#8220;index.handler&#8221;, which refers to the main js file in the ZIP archive (See Figure 2).

<div id="attachment_2295" style="width: 536px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni02.png"><img src="/content/uploads/2016/10/Muni02-526x600.png" alt="Figure 2: Create an AWS Lambda function" width="526" height="600" class="size-large wp-image-2295" srcset="/content/uploads/2016/10/Muni02-526x600.png 526w, /content/uploads/2016/10/Muni02-307x350.png 307w, /content/uploads/2016/10/Muni02-768x876.png 768w, /content/uploads/2016/10/Muni02.png 926w" sizes="(max-width: 526px) 100vw, 526px" /></a>

  <p class="wp-caption-text">
    Figure 2: Create an AWS Lambda function
  </p>
</div>

Create via a &#8220;custom role&#8221; a &#8220;basic execution role&#8221; for Lambda, which will have the following policy by default:

<pre>{
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
</pre>

Leave all other settings as default, click &#8220;Next&#8221; and afterwards &#8220;Create function&#8221; (See Figure 3).

<div id="attachment_2297" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni03.png"><img src="/content/uploads/2016/10/Muni03-600x485.png" alt="Figure 3: AWS Lambda function for Alexa Skill" width="600" height="485" class="size-large wp-image-2297" srcset="/content/uploads/2016/10/Muni03-600x485.png 600w, /content/uploads/2016/10/Muni03-350x283.png 350w, /content/uploads/2016/10/Muni03-768x620.png 768w, /content/uploads/2016/10/Muni03.png 921w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 3: AWS Lambda function for Alexa Skill
  </p>
</div>

After the Lambda function has been created successfully, note down the ARN, which is later needed in the Alexa skill setup (See Figure 4).

<div id="attachment_2298" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni04.png"><img src="/content/uploads/2016/10/Muni04-600x123.png" alt="Figure 4: ARN of the AWS Lambda function" width="600" height="123" class="size-large wp-image-2298" srcset="/content/uploads/2016/10/Muni04-600x123.png 600w, /content/uploads/2016/10/Muni04-350x72.png 350w, /content/uploads/2016/10/Muni04-768x157.png 768w, /content/uploads/2016/10/Muni04.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: ARN of the AWS Lambda function
  </p>
</div>

This complete the creation of the AWS Lambda function.

## Setting up the custom Alexa Skill

Next we will need to setup a custom Alexa Skill that interacts with the AWS Lambda function above. For this login to your <a href="https://developer.amazon.com/edw/home.html#/skills/list" target="_blank">Amazon Developer Account</a> and navigate to the Alexa Skills Kit section.

Add a New Skill. Leave the &#8220;Language&#8221; and &#8220;Skill Type&#8221; at the default value. Set &#8220;Next Muni Bus or Metro&#8221; as the skill name and &#8220;muni&#8221; as the invocation name (See Figure 5).

The &#8220;Invocation Name&#8221; is what is used to activate this particular skill. For example you would say: &#8220;Alexa, ask Muni when the next bus is coming.&#8221;

You might want to use &#8220;muny&#8221; instead of &#8220;muni&#8221; as Invocation Name, as my testing has shown that Alexa understands &#8220;Muni&#8221; as &#8220;muny&#8221;. Click &#8220;Next&#8221; to go the next screen.

<div id="attachment_2302" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni05.png"><img src="/content/uploads/2016/10/Muni05-600x356.png" alt="Figure 5: Create a new Alexa Skill" width="600" height="356" class="size-large wp-image-2302" srcset="/content/uploads/2016/10/Muni05-600x356.png 600w, /content/uploads/2016/10/Muni05-350x208.png 350w, /content/uploads/2016/10/Muni05-768x456.png 768w, /content/uploads/2016/10/Muni05.png 1003w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Create a new Alexa Skill
  </p>
</div>

Next you have to provide information for the voice interaction model. You can find all these information within the &#8220;<a href="https://github.com/chriselsen/Alexa_NextMuni/tree/master/speechAssets" target="_blank">speechAssets</a>&#8221; folder.

First create the three custom slot types &#8220;TRANSIT\_DIRECTION&#8221;, &#8220;TRANSIT\_LINE&#8221;, and &#8220;TRANSIT_TYPE&#8221; and fill them with the information from <a href="https://github.com/chriselsen/Alexa_NextMuni/tree/master/speechAssets/customSlotTypes" target="_blank">https://github.com/chriselsen/Alexa_NextMuni/tree/master/speechAssets/customSlotTypes</a>.

Next, copy the content of <a href="https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/IntentSchema.json" target="_blank">https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/IntentSchema.json</a> into the &#8220;Intent Schema&#8221; and the content of <a href="https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/SampleUtterances.txt" target="_blank">https://github.com/chriselsen/Alexa_NextMuni/blob/master/speechAssets/SampleUtterances.txt</a> into the &#8220;Sample Utterances&#8221; field.

Click &#8220;Next&#8221;to go to the next screen (See Figure 6).

<div id="attachment_2303" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni06.png"><img src="/content/uploads/2016/10/Muni06-600x573.png" alt="Figure 6: Voice interaction model" width="600" height="573" class="size-large wp-image-2303" srcset="/content/uploads/2016/10/Muni06-600x573.png 600w, /content/uploads/2016/10/Muni06-350x334.png 350w, /content/uploads/2016/10/Muni06-768x734.png 768w, /content/uploads/2016/10/Muni06.png 1013w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 6: Voice interaction model
  </p>
</div>

Chose &#8220;Lambda&#8221; as the &#8220;Service Endpoint Type&#8221; and specify the ARN to be in &#8220;North America&#8221;. Next copy the ARN for the Lambda function that you previously created into the field (See Figure 7).

Leave the &#8220;Account Linking&#8221; as is and click &#8220;Next&#8221;.

<div id="attachment_2304" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni07.png"><img src="/content/uploads/2016/10/Muni07-600x423.png" alt="Figure 7: AWS Lambda as service endpoint" width="600" height="423" class="size-large wp-image-2304" srcset="/content/uploads/2016/10/Muni07-600x423.png 600w, /content/uploads/2016/10/Muni07-350x247.png 350w, /content/uploads/2016/10/Muni07-768x541.png 768w, /content/uploads/2016/10/Muni07.png 1018w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 7: AWS Lambda as service endpoint
  </p>
</div>

Make sure that your skill is enabled for testing on your account (See Figure 8). This will allow you to use this skill in your account without having to publish it.

Before invoking your Echo or Fire TV device, you can also use the &#8220;Service Simulator&#8221; to test your skill: In the &#8220;Enter Utterence&#8221; field enter &#8220;for the next train&#8221; and click on &#8220;Ask Next Muni Bus or Metro&#8221; .

You will see the request that is send off to Lambda, as well as the response received from Lambda. If everything is working correctly you should an answer like &#8220;The next metros are N in 6 minutes, KT in 9 minutes, and N in 16 minutes.&#8221; (See Figure 8).

<div id="attachment_2305" style="width: 593px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Muni08.png"><img src="/content/uploads/2016/10/Muni08-583x600.png" alt="Figure 8: Test your Alexa Skill" width="583" height="600" class="size-large wp-image-2305" srcset="/content/uploads/2016/10/Muni08-583x600.png 583w, /content/uploads/2016/10/Muni08-340x350.png 340w, /content/uploads/2016/10/Muni08-768x791.png 768w, /content/uploads/2016/10/Muni08.png 1006w" sizes="(max-width: 583px) 100vw, 583px" /></a>

  <p class="wp-caption-text">
    Figure 8: Test your Alexa Skill
  </p>
</div>

Don&#8217;t fill out the sections &#8220;Publishing Information&#8221; and &#8220;Privacy & Compliance&#8221;, as you cannot submit this skill for Certification. Instead only you can use it from your account.

You are now able to start using the skill on your device! You can also go to your Echo companion webpage (<a href="http://echo.amazon.com/#skills" target="_blank">http://echo.amazon.com/#skills</a>) and see the skill enabled.

## Using the Alexa Skill

There are two main capabilities that this Alexa Skill will provide you:

  * **Ask for the next bus or metro.** The Alexa Skill will tell you the next three connections from a pre-configured stop ID. If there is a system notification, it will warn you about it as well.
  * **Ask if there is a system notification.** The Alexa Skill will reply with the system messages that are of priority &#8220;High&#8221;. These usually refer to service outages or impactes and don&#8217;t include &#8220;Elevator outages&#8221;.

Here are some examples on what you can ask the Alexa Skill about:

Q: &#8220;Alexa, ask Muni when the next metros are coming.&#8221;  
A: &#8220;The next metros are N in 1 minute, KT in 6 minutes, and N in 9 minutes.&#8221;



Q: &#8220;Alexa, ask Muni for the next 45.&#8221;  
A: &#8220;The next outbound 45 buses are 45 in 5 minutes, 45 in 17 minutes, and 45 in 32 minutes.&#8221;



Q: &#8220;Alexa, ask Muni for the next inbound 10.&#8221;  
A: &#8220;The next inbound 10 buses are 10 in 3 minutes, 10 in 21 minutes, and 10 in 34 minutes.&#8221;



Q: &#8220;Alexa, ask Muni if there is a problem with the 45 bus.&#8221;  
A: &#8220;There is currently no service message for the outbound 45 buses.&#8221;

## Limitations

Please keep in mind that the prediction data for the next buses and metros, but also the service messages come from <a href="https://www.nextbus.com" target="_blank">NextBus</a> via their <a href="https://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf" target="_blank">API</a>. The service messages are provided by <a href="https://www.sfmta.com/" target="_blank">Muni</a> to NextBus.

Unfortunately providing these service messages to NextBus is a manual step for Muni, which means that it is very frequently forgotten. Therefore the Alexa Skill might happily tell you &#8220;There is currently no service message for the metros.&#8221; while reality looks quite different (See Figure 9).

<div id="attachment_2310" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/2016-03-07-08.53.42.jpg"><img src="/content/uploads/2016/10/2016-03-07-08.53.42-600x338.jpg" alt="Figure 9: SF Muni Metro service interruption" width="600" height="338" class="size-large wp-image-2310" srcset="/content/uploads/2016/10/2016-03-07-08.53.42-600x338.jpg 600w, /content/uploads/2016/10/2016-03-07-08.53.42-350x197.jpg 350w, /content/uploads/2016/10/2016-03-07-08.53.42-768x432.jpg 768w, /content/uploads/2016/10/2016-03-07-08.53.42.jpg 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 9: SF Muni Metro service interruption
  </p>
</div>

Also predictions for buses and metros at the beginning of a line &#8211; which is the case of the N, 30 and 45 in my case &#8211; are rather less reliable.

## Summary

This post showed you how to create your own custom Amazon Alexa Skill to get next bus and next metro information for San Francisco&#8217;s Muni. You can use this custom Alexa Skill with an Amazon Echo or Fire TV device.
