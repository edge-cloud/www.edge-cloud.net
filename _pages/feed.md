---
sitemap: false
layout: none
permalink: /feed.xml
---

<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title type="text">{{ site.title | xml_escape }}</title>
  <subtitle type="html">{{ site.description | xml_escape }}</subtitle>
  <updated>{{ site.time | date_to_xmlschema }}</updated>
  <id>{{ "/feed.xml" | prepend: site.baseurl | prepend: site.url }}</id>
  <author>
    <name>Christian Elsen</name><uri>https://www.edge-cloud.net/about/</uri>
  </author>
  <link rel="self" type="application/atom+xml" href="{{ "/feed.xml" | prepend: site.baseurl | prepend: site.url }}"/>
  <link rel="alternate" type="text/html" href="{{ site.url }}{{ site.baseurl }}"/>

  {% for post in site.posts limit:10 %}
    <entry>
      <title>{{ post.title | xml_escape }}</title>
      <id>{{ post.url | prepend: site.baseurl | prepend: site.url }}</id>
      <updated>{{ post.date | date_to_xmlschema }}</updated>
      <published>{{ post.date | date_to_xmlschema }}</published>
      <link href="{{ post.url | prepend: site.baseurl | prepend: site.url }}"/>
      <summary type="html">{{ post.excerpt | xml_escape }}</summary>
      <content type="html">{{ post.content | strip_html | xml_escape | truncatewords:75 }}</content>
      {% for tag in post.tags %}
      <category term="{{ tag | xml_escape }}"/>
      {% endfor %}
      {% for cat in post.categories %}
      <category term="{{ cat | xml_escape }}"/>
      {% endfor %}
    </entry>
  {% endfor %}
</feed>
