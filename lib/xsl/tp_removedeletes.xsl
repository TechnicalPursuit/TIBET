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
	Here we match any elements without a tibet:crud attribute along with
	those whose tibet:crud is set to (d)eleted. The result is that anything
	flagged as deleted isn't copied to the output document.
	-->
	<xsl:template match="*">
		<xsl:if test="not(@tibet:crud) or (@tibet:crud != 'delete')">
			<xsl:copy>
				<xsl:copy-of select="@*"/>
				<xsl:apply-templates/>
			</xsl:copy>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>
