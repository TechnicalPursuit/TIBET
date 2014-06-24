<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- 
	Strip spans, types are divs.
	-->
	<xsl:template match="//*[local-name()='span']">
	</xsl:template>
	
	<!-- 
	Strip instance divs.
	-->
	<xsl:template match="//*[local-name()='div'][@type='inst']">
	</xsl:template>

</xsl:stylesheet>
