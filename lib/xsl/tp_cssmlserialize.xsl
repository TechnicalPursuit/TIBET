<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:css="http://www.technicalpursuit.com/2008/cssml"
    version="1.0" xmlns:html="http://www.w3.org/1999/xhtml">

    <xsl:output cdata-section-elements="html:style"/>
    
    <!-- Filter out all other nodes that don't match -->
    <xsl:template match="@*|node()"></xsl:template>

    <xsl:template match="css:comment"></xsl:template>
    
    <xsl:template match="text()">
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template>
 
    <xsl:template match="css:sheet">
        <xsl:variable name="theStuff">
            <xsl:apply-templates select="@*|node()"/>
        </xsl:variable>
        <html:style type="text/css">
            <xsl:value-of select="$theStuff"/>
        </html:style>
    </xsl:template>
 
    <xsl:template match="css:rulegroup">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="css:rule[not(@custom)]">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="css:selector">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="css:w3c">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template>
    
    <xsl:template match="css:declarations">
        <xsl:text>&#xa;{&#xa;</xsl:text>
        <xsl:apply-templates select="@*|node()"/>
        <xsl:text>}&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="css:declaration">
        <xsl:apply-templates select="@*|node()"/>
        <xsl:if test="text()[normalize-space(.)]">
            <xsl:text>;&#xa;</xsl:text>
        </xsl:if>
    </xsl:template>

</xsl:stylesheet>
