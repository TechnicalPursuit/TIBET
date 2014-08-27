<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- Look for elements named 'span' and wrap them with a 'span' that has
			a red text color and whatever other attributes the 'span' had.
			-->
	<xsl:template match="//*[name(.) = 'span']">
		<span xmlns="http://www.w3.org/1999/xhtml" style="color: red">
			<xsl:copy>
				<xsl:copy-of select="@*"/>
				<xsl:apply-templates select="@*|node()"/>
			</xsl:copy>
		</span>
	</xsl:template>

</xsl:stylesheet>
