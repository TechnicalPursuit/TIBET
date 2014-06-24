<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:css="http://www.technicalpursuit.com/2008/cssml">

    <!-- Filter out all other nodes that don't match -->
    <xsl:template match="@*|node()"> </xsl:template>

    <xsl:template match="css:sheet">
        <css:sheet>
            <xsl:apply-templates select="@*|node()"/>
        </css:sheet>
    </xsl:template>

    <xsl:template match="css:declarations"> </xsl:template>

    <xsl:template match="css:rule">
        <css:rulegroup>
            <xsl:choose>
                <xsl:when test="css:selector[@custom]">
                    <css:customselector custom="selector" specificity="{css:selector/@specificity}"
                        toggleattr="{css:selector/css:tibet/@toggleattr}">
                        <xsl:value-of select="css:selector/css:w3c/text()"/>
                    </css:customselector>
                    <xsl:if test="css:declarations/css:declaration[not(@custom)]">
                        <css:rule>
                            <css:selector specificity="{css:selector/@specificity}">
                                <xsl:value-of select="css:selector/css:tibet/text()"/>
                            </css:selector>
                            <css:declarations>
                                <xsl:copy-of select="css:declarations/css:declaration[not(@custom)]"/>
                            </css:declarations>
                        </css:rule>
                    </xsl:if>
                    <xsl:if test="css:declarations/css:declaration[@custom]">
                        <css:rule custom="declarations">
                            <css:selector specificity="{css:selector/@specificity}">
                                <xsl:value-of select="css:selector/css:tibet/text()"/>
                            </css:selector>
                            <css:declarations>
                                <xsl:apply-templates select="css:declarations/css:declaration[@custom]"/>
                            </css:declarations>
                        </css:rule>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <css:rule>
                        <css:selector specificity="{css:selector/@specificity}">
                            <xsl:value-of select="css:selector/css:w3c/text()"/>
                        </css:selector>
                        <css:declarations>
                            <xsl:copy-of select="css:declarations/css:declaration[not(@custom)]"/>
                        </css:declarations>
                    </css:rule>
                    <css:rule custom="declarations">
                        <css:selector specificity="{css:selector/@specificity}">
                            <xsl:value-of select="css:selector/text()"/>
                        </css:selector>
                        <css:declarations>
                            <xsl:apply-templates select="css:declarations/css:declaration[@custom]"/>
                        </css:declarations>
                    </css:rule>
                </xsl:otherwise>
            </xsl:choose>
        </css:rulegroup>
    </xsl:template>

    <xsl:template match="css:declarations/css:declaration[@custom]">
        <css:declaration>
            <xsl:copy-of select="./text()"/>
        </css:declaration>
    </xsl:template>

</xsl:stylesheet>
