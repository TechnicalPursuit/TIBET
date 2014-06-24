<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output unless we filter otherwise -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!-- 
	Here we match any elements with a crud flag of 'd' so we can skip them
	and their children.
	-->
	<xsl:template match="//*[@tibet:crud = 'delete']">
	</xsl:template>

	<!-- 
	Here we match any attribute nodes starting with tibet:crud and remove them
	as well...
	-->
	<xsl:template match="@*[starts-with(name(), 'tibet:crud')]">
		<xsl:choose>
			<xsl:when test="string() != 'delete'">
			</xsl:when>
			<xsl:otherwise>
				<xsl:copy>
					<xsl:copy-of select="."/>
					<xsl:apply-templates/>
				</xsl:copy>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
