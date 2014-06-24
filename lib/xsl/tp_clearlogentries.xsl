<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="logname" select="'activity'"/>

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- 
	-->
	<xsl:template match="html:li">
		<xsl:if test="@log != $logname">
			<xsl:copy>
				<xsl:copy-of select="@*"/>
				<xsl:apply-templates/>
			</xsl:copy>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>
