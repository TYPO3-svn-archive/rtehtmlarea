<?xml version="1.0" encoding="iso-8859-1"?>
<!--
	Indite Transform
	Ruleset	    : article
	Target      : runtime
	Revision    : 0.1
	
	todo        : Rootnodes, that are not contained in a blocklevel tag (p|h2) should be wrapped
	              in a <p>

	              Empty <p> nodes should be stripped off.
	              
	              Nodes that only allows textcontent (h2, a) should allow <span id="indite-cursor-marker">

	Any help on the todo's or other improvements to the xslt are greatly appreciated, since i'm
	not too good with the language.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" omit-xml-declaration="yes" indent="no" encoding="iso-8859-1" />
<xsl:strip-space elements="*"/>

<xsl:template match="/body">
<body>
	<xsl:apply-templates/>
</body>
</xsl:template>

<xsl:template match="h1|h2|h3|h4|h5|h6">
	<h2><xsl:copy-of select=".//text()"/></h2>
</xsl:template>

<!-- wrap text in root -->
<xsl:template match="/body/text()">
	<p><xsl:value-of select="."/></p>
</xsl:template>

<!-- unfortunately this doesn't work  -->
<!--
<xsl:template match="/body/text()">
	<p>
		<xsl:value-of select="."/>
		<xsl:if test="/body/b">
			<xsl:copy-of select="/body/b"/>
		</xsl:if>
		<xsl:if test="/body/strong">
			<xsl:copy-of select="/body/strong"/>
		</xsl:if>
		<xsl:if test="/body/em">
			<xsl:copy-of select="/body/em"/>
		</xsl:if>
		<xsl:if test="/body/i">
			<xsl:copy-of select="/body/i"/>
		</xsl:if>
	</p>
</xsl:template>
<xsl:template match="/body/b"/>
<xsl:template match="/body/strong"/>
<xsl:template match="/body/em"/>
<xsl:template match="/body/i"/>
<xsl:template match="/body/p">
	<xsl:copy>
		<xsl:value-of select="."/>
	</xsl:copy>
</xsl:template>
-->

<!-- remove doubles -->
<xsl:template match="b/b|i/i|p/p">
	<xsl:apply-templates/>
</xsl:template>

<xsl:template match="p">
	<p><xsl:apply-templates/></p>
</xsl:template>

<xsl:template match="pre">
	<pre><xsl:apply-templates/></pre>
</xsl:template>

<xsl:template match="ol">
	<ol><xsl:apply-templates/></ol>
</xsl:template>

<xsl:template match="ul">
	<ul><xsl:apply-templates/></ul>
</xsl:template>

<xsl:template match="li">
	<li><xsl:apply-templates/></li>
</xsl:template>

<xsl:template match="strong|b">
	<b><xsl:apply-templates/></b>
</xsl:template>

<xsl:template match="em|i">
	<i><xsl:apply-templates/></i>
</xsl:template>

<xsl:template match="strike">
	<strike><xsl:apply-templates/></strike>
</xsl:template>

<xsl:template match="sub">
	<sub><xsl:apply-templates/></sub>
</xsl:template>

<xsl:template match="sup">
	<sup><xsl:apply-templates/></sup>
</xsl:template>

<xsl:template match="br">
	<br/>
</xsl:template>

<xsl:template match="span">
	<xsl:choose>
		<xsl:when test="@id='indite-cursor-marker'">
			<span id="indite-cursor-marker"><xsl:apply-templates/></span>
		</xsl:when>
		<xsl:when test="@style='font-weight:bold'">
			<b><xsl:apply-templates/></b>
		</xsl:when>
		<xsl:when test="@style='font-style:italic'">
			<i><xsl:apply-templates/></i>
		</xsl:when>
		<xsl:otherwise>
			<xsl:apply-templates/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="a">
	<xsl:choose>
		<xsl:when test="@target=''">
			<a href="{@href}"><xsl:copy-of select=".//text()"/></a>
		</xsl:when>
		<xsl:otherwise>
			<a href="{@href}" target="{@target}"><xsl:copy-of select=".//text()"/></a>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="img">
	<img src="{@src}" height="{@height}" width="{@width}" alt="{@alt}" align="{@alt}" />
</xsl:template>

</xsl:stylesheet>