<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:css="http://www.technicalpursuit.com/2008/cssml"
				version="1.0">

	<!-- Filter out all other nodes that don't match -->
	<xsl:template match="@*|node()">
	</xsl:template>

    <xsl:template match="root">
        <css:sheet>
            <xsl:apply-templates select="@*|node()"/>
        </css:sheet>
    </xsl:template>

    <xsl:template match="template">
        <css:template>
            <xsl:value-of select="'foofy'"/>
        </css:template>
    </xsl:template>

    <xsl:template match="declarations">
        <xsl:variable name="precSibName">
            <xsl:value-of select="normalize-space(preceding-sibling::node()[1])"/>
        </xsl:variable>
        <css:rule>
            <xsl:choose>
                <xsl:when test="starts-with($precSibName, '@')">
                    <css:identifier>
                        <xsl:value-of select="$precSibName"/>
                    </css:identifier>
					<css:instructions>
						<xsl:copy-of select="normalize-space(node())"/>
						<xsl:apply-templates select="@*|node()"/>
					</css:instructions>
                </xsl:when>
                <xsl:otherwise>
                    <css:selector>
                        <xsl:value-of select="$precSibName"/>
                    </css:selector>
					<css:declarations>
						<xsl:copy-of select="normalize-space(node())"/>
						<xsl:apply-templates select="@*|node()"/>
					</css:declarations>
                </xsl:otherwise>
            </xsl:choose>
        </css:rule>
    </xsl:template>

</xsl:stylesheet>
