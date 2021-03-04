

const skipSpace = source => source.replace(/^\s+/, '')
const startsWith = (source, val) => source.startsWith(val)

const TOKEN_TYPE = {
    Empty: -1,
    Title: 1,
    Blockquote: 2,
    UnOrder: 3,
    Code: 4,
    Text: 5
}

const createToken = (
    type = TOKEN_TYPE.Empty,
    row = '',
    text = '',
    symbol = ''
) => ({
    type,
    row,
    text,
    symbol
})

const rules = {
    mulLine: /(.*?)\n *\n/s,
    title: /(#+) +([^\n]+)/,
    code: /```([^\n]*)\n(.*?)\n```/s
}

let str = `
# 这是一级标题


> 这是一段引用，滴滴滴
12312

- list1
- list2
- list 3

## 这是二级标题

* list1
* list2
* list 3

\`\`\`javascript

let a = 123

let b = 456

function dd () {}

\`\`\`
`

class Lexer {
    constructor() {
        this.tokens = []
    }

    static lex(source) {
        source = source.replace(/\t/g, '    ').replace(/\r?\n/, '\n')
        return new Lexer().lex(source)
    }

    lex(source) {
        while (source) {
            source = skipSpace(source)
            let token = createToken()
            if (
                startsWith(source, '#')
            ) {
                [token, source] = this.parseTitle(source)
            }  else if (
                startsWith(source, '> ')
            ) {
                [token, source] = this.parseBlockquote(source)
            } else if (
                startsWith(source, '```')
            ) {
                [token, source] = this.parseCode(source)
            } else if (
                /^[-+*] /.test(source)
            ) {
                [token, source] = this.parseUnOrder(source)
            } else {
                [token, source] = this.parseText(source)
            }
            this.tokens.push(token)
        }
        return this.tokens
    }

    parseTitle(source) {
        const match = source.match(rules.title)
        if (!match) return this.parseText(source)
        const [row, symbol, text] = match
        const token = createToken(
            TOKEN_TYPE.Title,
            row,
            text,
            symbol
        )
        source = source.slice(row.length)
        return  [token, source]
    }

    parseMulLine(source) {
        const match = source.match(rules.mulLine)
        let matchText
        if (!match) {
            matchText = source
            source = ''
        } else {
            matchText = match[1]
            source = source.slice(match[0].length)
        }
        return [matchText, source]
    }

    parseBlockquote(source) {
        const  [matchText, val] = this.parseMulLine(source)
        const token = createToken(
            TOKEN_TYPE.Blockquote,
            matchText,
            matchText.replace(/>/g, ' ').replace(/\n/, ' ')
        )
        return [token, val]
    }

    parseUnOrder(source) {
        const  [matchText, val] = this.parseMulLine(source)
        const token = createToken(
            TOKEN_TYPE.UnOrder,
            matchText,
            matchText
        )
        return [token, val]
    }

    parseCode(source) {
        const match = source.match(rules.code)
        if (!match) return this.parseText(source)
        const [row, symbol, text] = match
        const token = createToken(
            TOKEN_TYPE.Code,
            row,
            text,
            symbol
        )
        source = source.slice(row.length)
        return  [token, source]
    }

    parseText(source) {
        const  [matchText, val] = this.parseMulLine(source)
        const token = createToken(
            TOKEN_TYPE.Text,
            matchText,
            matchText
        )
        return [token, val]
    }

}

let tokens = Lexer.lex(str);

console.log(tokens)

