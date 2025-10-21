#!/bin/bash

# コメント可能なソースコードファイルにパスコメントを追加するスクリプト

files=(
    "./app/api/auth/[...nextauth]/route.ts"
    "./app/api/expenses/[id]/route.ts"
    "./app/api/expenses/route.ts"
    "./app/api/groups/[id]/expenses/route.ts"
    "./app/api/groups/[id]/route.ts"
    "./app/api/groups/[id]/settlements/route.ts"
    "./app/api/groups/route.ts"
    "./app/api/settlements/[id]/route.ts"
    "./app/api/settlements/route.ts"
    "./app/auth/signin/page.tsx"
    "./app/dashboard/groups/[id]/actions.ts"
    "./app/dashboard/groups/[id]/edit/page.tsx"
    "./app/dashboard/groups/[id]/expenses/new/page.tsx"
    "./app/dashboard/groups/[id]/page.tsx"
    "./app/dashboard/groups/new/page.tsx"
    "./app/dashboard/groups/page.tsx"
    "./app/dashboard/page.tsx"
    "./app/globals.css"
    "./app/groups/join/[code]/page.tsx"
    "./app/layout.tsx"
    "./app/page.tsx"
    "./auth.ts"
    "./components/expenses/ExpenseCard.tsx"
    "./components/expenses/ExpenseForm.tsx"
    "./components/expenses/ExpenseList.tsx"
    "./components/expenses/ManualExpenseForm.tsx"
    "./components/graphs/BalanceGraph.tsx"
    "./components/graphs/BalanceList.tsx"
    "./components/graphs/BalanceViewer.tsx"
    "./components/graphs/BalanceViewToggle.tsx"
    "./components/graphs/DebtEdge.tsx"
    "./components/graphs/UserNode.tsx"
    "./components/groups/DeleteGroupButton.tsx"
    "./components/groups/GroupCard.tsx"
    "./components/groups/GroupForm.tsx"
    "./components/groups/InviteLink.tsx"
    "./components/settlements/SettlementForm.tsx"
    "./components/settlements/SettlementList.tsx"
    "./components/ui/tabs.tsx"
    "./convert-svg-to-png.js"
    "./generate-icons.html"
    "./generate-icons.js"
    "./lib/api/groups.ts"
    "./lib/prisma.ts"
    "./lib/utils/balance.ts"
    "./lib/utils/graph.ts"
    "./lib/utils/invite-code.ts"
    "./lib/utils/migrate-invite-codes.ts"
    "./lib/validations/expense.ts"
    "./lib/validations/group.ts"
    "./lib/validations/settlement.ts"
    "./next-env.d.ts"
    "./next.config.js"
    "./scripts/migrate-invite-codes.ts"
    "./tailwind.config.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # ファイルの拡張子を取得
        ext="${file##*.}"
        
        # ファイルの最初の行を取得
        first_line=$(head -n 1 "$file" 2>/dev/null || echo "")
        
        # 既にパスコメントがある場合はスキップ
        if [[ "$first_line" == "// "* ]] || [[ "$first_line" == "/* "* ]] || [[ "$first_line" == "<!-- "* ]] || [[ "$first_line" == "# "* ]]; then
            echo "Skipping $file (already has path comment)"
            continue
        fi
        
        # パスコメントを追加
        case "$ext" in
            "js"|"ts"|"tsx")
                sed -i '' "1i\\
// ${file#./}
" "$file"
                ;;
            "py")
                sed -i '' "1i\\
# ${file#./}
" "$file"
                ;;
            "html")
                sed -i '' "1i\\
<!-- ${file#./} -->
" "$file"
                ;;
            "css"|"scss")
                sed -i '' "1i\\
/* ${file#./} */
" "$file"
                ;;
            *)
                echo "Unknown extension for $file"
                ;;
        esac
        
        echo "Added path comment to $file"
    else
        echo "File not found: $file"
    fi
done

echo "Path comment addition completed!"
