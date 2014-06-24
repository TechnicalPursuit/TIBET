<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<tibet_metadata>
			<xsl:apply-templates select="//html:div[@isNative != 'true']">
				<xsl:sort select="@id" />
			</xsl:apply-templates>
		</tibet_metadata>
	</xsl:template>

	<xsl:template match="html:div">
		<tibet_type name="{@id}" />
	</xsl:template>

</xsl:stylesheet>
