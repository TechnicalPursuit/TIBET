<?xml version="1.0" encoding="UTF-8"?>

<!-- This sheet transforms the xctrls:dialog element into its final
	 representation. -->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:xctrls="http://www.technicalpursuit.com/2005/xcontrols"
	xmlns:drag="http://www.technicalpursuit.com/2005/drag"
	xmlns:ev="http://www.w3.org/2001/xml-events"
	xmlns:tsh="http://www.technicalpursuit.com/1999/tshell"
	xmlns:pclass="urn:tibet:pseudoclass"
	xmlns="http://www.w3.org/1999/xhtml">

	<xsl:output method="xml" indent="yes" />

	<!-- Match the root 'tsh:template' element. -->
	<xsl:template match="tsh:template">
		<xctrls:dialog>
			<xsl:attribute name="tibet:ctrl">xctrls:dialog</xsl:attribute>
			<div tibet:pelem="header" drag:mover="true" drag:item="..">
				<xsl:apply-templates select="xctrls:title/node()"/>
			</div>
			<div tibet:pelem="body">
				<xsl:apply-templates select="xctrls:body/node()"/>
			</div>
			<div tibet:pelem="footer" drag:resizer="true" drag:item=".."/>
		</xctrls:dialog>
	</xsl:template>

	<xsl:template match="tsh:template[@modal='true']">
		<xctrls:dialog>
			<xsl:attribute name="tibet:ctrl">xctrls:dialog</xsl:attribute>
			<xsl:attribute name="pclass:closed">true</xsl:attribute>
			<!-- TODO: Need to grab the value of 'class' here -->
			<xsl:attribute name="class">xctrls-dialog ALERT_TIER</xsl:attribute>
			<div tibet:pelem="header">Alert</div>
			<div tibet:pelem="body">
				<xsl:apply-templates select="xctrls:body/node()"/>
			</div>
		</xctrls:dialog>
	</xsl:template>

	<xsl:template match="body">
		<xctrls:curtain/>
		<xsl:apply-templates select="@*|node()"/>
	</xsl:template>

	<!-- The classic 'identity transformation', which copies all nodes and
		 attributes to the output. -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

</xsl:stylesheet>
