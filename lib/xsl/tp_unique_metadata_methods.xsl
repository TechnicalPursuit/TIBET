<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:key name="uniqueMethodKey" match="//*[local-name()='span']" use="@name"/>

	<xsl:template match="/">
		<resultText>
			<xsl:for-each select="//*[local-name()='span'][generate-id() = generate-id(key('uniqueMethodKey',@name)[1])]">
				<xsl:value-of select="@name"/>
				<xsl:text>,</xsl:text>
			</xsl:for-each>
		</resultText>
	</xsl:template>

</xsl:stylesheet>
