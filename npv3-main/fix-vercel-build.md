# Fixing Your Vercel Build Errors

This guide helps you resolve common ESLint errors and warnings that cause Vercel builds to fail. Follow these steps to get your NodePilot project building and deploying successfully.

## 1. First, Let's Fix the Critical Error Blocking the Build

### Fix the Unescaped Apostrophe in Marketing Page

Open `src/app/(marketing)/page.tsx` and go to line 110. You need to find an apostrophe character (`'`) and replace it with `&apos;`.

```bash
# Pull the latest code if needed
git pull origin main

# Open the file in your editor
# Change the apostrophe from ' to &apos;
# For example:
# Before: <p>Don't miss this opportunity</p>
# After:  <p>Don&apos;t miss this opportunity</p>

# Save the file
git add src/app/\(marketing\)/page.tsx
git commit -m "fix: escape apostrophe in marketing page"
git push origin main
```

This should fix the critical ESLint error and allow your build to complete.

---

## 2. Fix the Image-Related ESLint Warnings

These ESLint warnings don't block builds but affect performance and accessibility.

### 🖼️ OG Route Image (in `src/app/og/route.tsx`)
```tsx
// Before
<img src="your-image-url" />

// After
<img src="your-image-url" alt="NodePilot logo" />
```

### 🧑‍🎨 Avatar Circles Component (`src/components/avatar-circles.tsx`)
```tsx
import Image from 'next/image';

<Image 
  src={avatar.src} 
  alt={`Avatar for ${avatar.name || 'user'}`}
  width={40}
  height={40}
  className="your-existing-classes"
/>
```

### 🧭 TopNav Component (`src/components/dashboard/TopNav.tsx`)
```tsx
import Image from 'next/image';

<Image 
  src="your-image-url" 
  alt="Profile picture" 
  width={32}
  height={32}
  className="your-existing-classes"
/>
```

---

## 3. Fix React Hook Dependency Warnings

Open `src/components/features-horizontal.tsx` and fix your `useEffect` dependencies.

```tsx
useEffect(() => {
  // logic
}, [collapseDelay, data.length]);
```

Make sure each `useEffect` lists **all referenced variables**.

---

## 4. (Optional) Temporary ESLint Ignore for Deployment

If you just need to deploy quickly, add this to your `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig;
```

Then push:
```bash
git add next.config.js
git commit -m "chore: ignore ESLint temporarily for deploy"
git push origin main
```

---

## ✅ Recommended Long-Term Strategy

1. Fix apostrophe issue and push ✅  
2. Create a new branch for remaining ESLint warning fixes  
3. Run `npm run lint` locally after every feature  
4. Test everything before PR merge  
5. Clean up all warnings before next major release  

---

## 💡 Tips
- Use `<Image />` from `next/image` instead of `<img>`  
- Always include `alt` props  
- Watch for stale React closures in `useEffect`  
- Run `npm run lint` and `npm audit fix` regularly  

## 🔄 Continuous Integration Best Practices

1. Set up GitHub Actions to run ESLint on PRs
2. Use Husky pre-commit hooks for local linting
3. Configure VSCode ESLint plugin for real-time feedback
4. Document any ESLint rule customizations in team wiki

---

## 📚 Additional Resources

- [Next.js ESLint Documentation](https://nextjs.org/docs/basic-features/eslint)
- [React Hooks ESLint Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Next.js Image Component Guide](https://nextjs.org/docs/api-reference/next/image)
- [Vercel Build Step Documentation](https://vercel.com/docs/concepts/deployments/build-step) 