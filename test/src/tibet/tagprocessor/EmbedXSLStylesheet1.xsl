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

	<!-- Look for elements named 'h3' and replace them with a 'span' that has
			a blue background wrapping the descendants contents of the
			'h3' -->
	<xsl:template match="//*[name(.) = 'h3']">
		<span xmlns="http://www.w3.org/1999/xhtml" id="colorizedSpan" style="background-color: blue">
			This content is from the span and everything should have a
			background of blue.
			<xsl:apply-templates select="@*|node()"/>
		</span>
	</xsl:template>

</xsl:stylesheet>
